import path from 'path';
import fs from 'fs';

import express, { Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';

import DB from '../lib/storage/db';
import StorageHandler from '../lib/storage/StorageHandler';
import { sendError } from '../lib/error/sendError';
import { getLimitMessage } from '../lib/misc/getLimitMessage';
import { getUploadLimits } from '../lib/misc/getUploadLimits';
import { UploadedFile } from '../lib/storage/types';
import ErrorHandler, {
  UNSUPPORTED_FORMAT_MD,
  NO_PACKAGE_ERROR,
} from '../lib/misc/ErrorHandler';
import { BytesToMegaBytes } from '../lib/misc/file';
import { PrepareDeck } from '../lib/parser/DeckParser';
import Package from '../lib/parser/Package';
import Settings from '../lib/parser/Settings';
import {
  hasMarkdownFileName,
  isHTMLFile,
  isZIPFile,
} from '../lib/storage/checks';
import { TEMPLATE_DIR } from '../lib/constants';
import { ZipHandler } from '../lib/anki/zip';
import cleanDeckName from '../lib/cleanDeckname';
import { getPackagesFromZip } from '../lib/getPackagesFromZip';

const upload = (res: express.Response, storage: StorageHandler) => {
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
};

const setFilename = (res: Response, filename: string) => {
  try {
    res.set('File-Name', cleanDeckName(filename));
  } catch (err) {
    sendError(err);
  }
};

function loadREADME(): string {
  return fs.readFileSync(path.join(TEMPLATE_DIR, 'README.html')).toString();
}

export const sendBundle = async (
  packages: Package[],
  storage: StorageHandler,
  res: Response
) => {
  const filename = `Your decks-${crypto.randomUUID()}.zip`;
  const payload = await ZipHandler.toZip(packages, loadREADME());
  setFilename(res, filename);
  res.status(200).send(payload);
};

// TODO: move this into notion controller, even better service?
const purgeBlockCache = (owner: string) => DB('blocks').del().where({ owner });

const registerUploadSize = async (
  file: UploadedFile,
  res: express.Response
) => {
  const isLoggedIn = res.locals.owner;
  if (!isLoggedIn) {
    return;
  }

  const filename = file.originalname;
  try {
    await DB('uploads').insert({
      owner: res.locals.owner,
      filename,
      key: file.key,
      size_mb: BytesToMegaBytes(file.size),
    });
  } catch (error) {
    sendError(error);
  }
};

const deleteUpload = async (req: express.Request, res: express.Response) => {
  const { key } = req.params;
  console.log('delete', key);
  if (!key) {
    return res.status(400).send();
  }
  try {
    const owner = res.locals.owner;
    await DB('uploads').del().where({ owner, key });
    await purgeBlockCache(owner);
    const s = new StorageHandler();
    await s.delete(key);
    console.log('done deleting', key);
  } catch (error) {
    sendError(error);
    return res.status(500).send();
  }
  return res.status(200).send();
};

const getUploads = async (_req: express.Request, res: express.Response) => {
  console.debug('download mine');
  try {
    const uploads = await DB('uploads')
      .where({ owner: res.locals.owner })
      .orderBy('id', 'desc')
      .returning('*');
    res.json(uploads);
  } catch (error) {
    sendError(error);
    res.status(400);
  }
};

const handleUpload = async (
  storage: StorageHandler,
  req: express.Request,
  res: express.Response
) => {
  try {
    const files = req.files as UploadedFile[];
    let packages: Package[] = [];
    let hasMarkdown: Boolean = hasMarkdownFileName(
      files.map((file) => file.originalname)
    );
    for (const file of files) {
      const filename = file.originalname;
      const settings = new Settings(req.body || {});
      await registerUploadSize(file, res);
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
        packages = packages.concat(extraPackages as Package[]);
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
      sendBundle(packages, storage, res);
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
};

const file = (req: express.Request, res: express.Response) => {
  console.time(req.path);
  const storage = new StorageHandler();
  const handleUploadEndpoint = upload(res, storage);

  handleUploadEndpoint(req, res, (error) => {
    if (error) {
      let msg = error.message;
      if (msg === 'File too large') {
        msg = getLimitMessage();
      } else {
        sendError(error);
      }
      console.timeEnd(req.path);
      return res.status(500).send(msg);
    }
    handleUpload(storage, req, res).then(() => {
      console.timeEnd(req.path);
    });
  });
};

const UploadController = {
  deleteUpload,
  getUploads,
  file,
};

export default UploadController;
