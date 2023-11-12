import fs from 'fs';
import path from 'path';

import express from 'express';
import multer from 'multer';

import { IUploadRepository } from '../data_layer/UploadRespository';
import { sendError } from '../lib/error/sendError';
import ErrorHandler, { NO_PACKAGE_ERROR } from '../lib/misc/ErrorHandler';
import { getUploadLimits } from '../lib/misc/getUploadLimits';
import Settings from '../lib/parser/Settings';
import Workspace from '../lib/parser/WorkSpace';
import StorageHandler from '../lib/storage/StorageHandler';
import { UploadedFile } from '../lib/storage/types';
import GeneratePackagesUseCase from '../usecases/uploads/GeneratePackagesUseCase';
import { toText } from './NotionService/BlockHandler/helpers/deckNameToText';

class UploadService {
  getUploadsByOwner(owner: number) {
    return this.uploadRepository.getUploadsByOwner(owner);
  }

  constructor(private readonly uploadRepository: IUploadRepository) {}

  async deleteUpload(owner: number, key: string) {
    const s = new StorageHandler();
    await this.uploadRepository.deleteUpload(owner, key);
    await s.delete(key);
  }

  getUploadHandler(res: express.Response) {
    const maxUploadCount = 21;
    return multer({
      limits: getUploadLimits(res.locals.patreon),
      dest: process.env.UPLOAD_BASE,
    }).array('pakker', maxUploadCount);
  }

  async handleUpload(
    storage: StorageHandler,
    req: express.Request,
    res: express.Response
  ) {
    try {
      let payload;
      let plen;
      const settings = new Settings(req.body || {});

      const useCase = new GeneratePackagesUseCase(storage);
      const { packages } = await useCase.execute(
        res.locals.patreon,
        req.files as UploadedFile[],
        settings
      );

      const first = packages[0];
      if (packages.length === 1) {
        if (!first.apkg) {
          const name = first ? first.name : 'untitled';
          throw new Error(`Could not produce APKG for ${name}`);
        }
        payload = first.apkg;
        plen = Buffer.byteLength(first.apkg);
        res.set('Content-Type', 'application/apkg');
        res.set('Content-Length', plen.toString());
        first.name = toText(first.name);
        try {
          res.set('File-Name', encodeURIComponent(first.name));
        } catch (err) {
          sendError(err);
          console.info(`failed to set name ${first.name}`);
        }

        res.attachment(`/${first.name}`);
        return res.status(200).send(payload);
      } else if (packages.length > 1) {
        const workspace = new Workspace(true, 'fs');

        for (const pkg of packages) {
          const p = path.join(workspace.location, pkg.name);
          fs.writeFileSync(p, pkg.apkg);
        }

        const url = `/download/${workspace.id}`;
        res.status(300);
        return res.redirect(url);
      } else {
        ErrorHandler(res, NO_PACKAGE_ERROR);
      }
    } catch (err) {
      sendError(err);
      ErrorHandler(res, err as Error);
    }
  }
}

export default UploadService;
