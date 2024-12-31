import express from 'express';

import { IUploadRepository } from '../data_layer/UploadRespository';
import ErrorHandler from '../routes/middleware/ErrorHandler';
import CardOption from '../lib/parser/Settings';
import Workspace from '../lib/parser/WorkSpace';
import StorageHandler from '../lib/storage/StorageHandler';
import { UploadedFile } from '../lib/storage/types';
import GeneratePackagesUseCase from '../usecases/uploads/GeneratePackagesUseCase';
import { toText } from './NotionService/BlockHandler/helpers/deckNameToText';
import { isPaying } from '../lib/isPaying';
import { isLimitError } from '../lib/misc/isLimitError';
import { handleUploadLimitError } from '../controllers/Upload/helpers/handleUploadLimitError';
import { NO_PACKAGE_ERROR } from '../lib/error/constants';

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

  async handleUpload(req: express.Request, res: express.Response) {
    try {
      let payload;
      let plen;
      const settings = new CardOption(req.body || {});
      const ws = new Workspace(true, 'fs');

      const useCase = new GeneratePackagesUseCase();
      const { packages } = await useCase.execute(
        isPaying(res.locals),
        req.files as UploadedFile[],
        settings,
        ws
      );

      console.log('packages', packages);

      const first = packages[0];
      if (packages.length === 1) {
        const apkg = await ws.getFirstAPKG();
        if (!apkg) {
          const name = first ? first.name : 'untitled';
          throw new Error(`Could not produce APKG for ${name}`);
        }
        payload = apkg;
        plen = Buffer.byteLength(apkg);
        res.set('Content-Type', 'application/apkg');
        res.set('Content-Length', plen.toString());
        first.name = toText(first.name);
        try {
          res.set('File-Name', encodeURIComponent(first.name));
        } catch (err) {
          console.info(`failed to set name ${first.name}`);
          console.error(err);
        }

        res.attachment(`/${first.name}`);
        return res.status(200).send(payload);
      } else if (packages.length > 1) {
        const url = `/download/${ws.id}`;
        res.status(300);
        return res.redirect(url);
      } else {
        ErrorHandler(res, req, NO_PACKAGE_ERROR);
      }
    } catch (err) {
      if (isLimitError(err as Error)) {
        handleUploadLimitError(req, res);
      } else {
        return ErrorHandler(res, req, err as Error);
      }
    }
  }
}

export default UploadService;
