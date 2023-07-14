import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';

import { sendBundle } from '../controllers/UploadController';
import UploadRepository from '../data_layer/UploadRespository';
import { sendError } from '../lib/error/sendError';
import ErrorHandler, {
  NO_PACKAGE_ERROR,
  UNSUPPORTED_FORMAT_MD,
} from '../lib/misc/ErrorHandler';
import { BytesToMegaBytes } from '../lib/misc/file';
import { getUploadLimits } from '../lib/misc/getUploadLimits';
import Settings from '../lib/parser/Settings';
import StorageHandler from '../lib/storage/StorageHandler';
import GeneratePackagesUseCase from '../usecases/uploads/GeneratePackagesUseCase';
import { toText } from './NotionService/BlockHandler/helpers/deckNameToText';
import { UploadedFile } from '../lib/storage/types';

class UploadService {
  getUploadsByOwner(owner: number) {
    return this.uploadRepository.getUploadsByOwner(owner);
  }

  constructor(private readonly uploadRepository: UploadRepository) {}

  async deleteUpload(owner: number, key: string) {
    const s = new StorageHandler();
    await this.uploadRepository.deleteUpload(owner, key);
    await s.delete(key);
  }

  getUploadHandler(res: express.Response, storage: StorageHandler) {
    return multer({
      limits: getUploadLimits(res.locals.patreon),
      storage: multerS3({
        s3: storage.s3,
        bucket: StorageHandler.DefaultBucketName(),
        key(_request, file, cb) {
          let suffix = '.zip';
          if (
            file.originalname.includes('.') &&
            file.originalname.split('.').length > 1
          ) {
            const parts = file.originalname.split('.');
            suffix = parts[parts.length - 1];
          }
          cb(null, storage.uniqify(file.originalname, 'upload', 256, suffix));
        },
      }),
    }).array('pakker', 21);
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
      const packages = await useCase.execute(
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
        await sendBundle(packages, res);
        console.info('Sent bundle with %d packages', packages.length);
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
