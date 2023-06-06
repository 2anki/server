import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';

import UploadRepository from '../data_layer/UploadRespository';
import { BytesToMegaBytes } from '../lib/misc/file';
import { getUploadLimits } from '../lib/misc/getUploadLimits';
import StorageHandler from '../lib/storage/StorageHandler';
import { UploadedFile } from '../lib/storage/types';
import { sendBundle } from '../controllers/UploadController';
import { getOwner } from '../lib/User/getOwner';
import cleanDeckName from '../lib/cleanDeckname';
import { sendError } from '../lib/error/sendError';
import { getPackagesFromZip } from '../lib/getPackagesFromZip';
import ErrorHandler, {
  UNSUPPORTED_FORMAT_MD,
  NO_PACKAGE_ERROR,
} from '../lib/misc/ErrorHandler';
import { PrepareDeck } from '../lib/parser/DeckParser';
import Package from '../lib/parser/Package';
import Settings from '../lib/parser/Settings';
import {
  hasMarkdownFileName,
  isHTMLFile,
  isZIPFile,
} from '../lib/storage/checks';

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

  registerUploadSize(file: UploadedFile, owner?: number) {
    const { originalname, key, size } = file;

    if (!owner) {
      return;
    }

    return this.uploadRepository.update(
      owner,
      originalname,
      key,
      BytesToMegaBytes(size)
    );
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
      const files = req.files as UploadedFile[];
      let packages: Package[] = [];
      let hasMarkdown: boolean = hasMarkdownFileName(
        files.map((file) => file.originalname)
      );
      for (const file of files) {
        const filename = file.originalname;
        const settings = new Settings(req.body || {});

        await this.registerUploadSize(file, getOwner(res));
        const key = file.key;
        const fileContents = await storage.getFileContents(key);

        if (isHTMLFile(filename)) {
          const d = await PrepareDeck(
            filename,
            [{ name: filename, contents: fileContents.Body }],
            settings
          );
          if (d) {
            const pkg = new Package(d.name, d.apkg);
            packages = packages.concat(pkg);
          }
        } else if (isZIPFile(filename) || isZIPFile(key)) {
          const { packages: extraPackages, containsMarkdown } =
            await getPackagesFromZip(
              fileContents.Body,
              res.locals.patreon,
              settings
            );
          packages = packages.concat(extraPackages);
          hasMarkdown = containsMarkdown;
        }
      }
      let payload;
      let plen;

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
        first.name = cleanDeckName(first.name);
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
        if (hasMarkdown) {
          ErrorHandler(res, UNSUPPORTED_FORMAT_MD);
        } else {
          ErrorHandler(res, NO_PACKAGE_ERROR);
        }
      }
    } catch (err) {
      sendError(err);
      ErrorHandler(res, err as Error);
    }
  }
}

export default UploadService;
