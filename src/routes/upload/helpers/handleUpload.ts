import express from 'express';

import StorageHandler from '../../../lib/storage/StorageHandler';
import { PrepareDeck } from '../../../lib/parser/DeckParser';
import Settings from '../../../lib/parser/Settings';
import { ZipHandler } from '../../../lib/anki/zip';
import ErrorHandler, { NO_PACKAGE_ERROR } from '../../../lib/misc/ErrorHandler';
import Package from '../../../lib/parser/Package';
import cleanDeckName from './cleanDeckname';
import { registerUploadSize } from './registerUploadSize';
import { sendBundle } from './sendBundle';
import { captureException } from '@sentry/node';

export default async function handleUpload(
  storage: StorageHandler,
  req: express.Request,
  res: express.Response
) {
  try {
    const files = req.files as Express.Multer.File[];
    let packages: Package[] = [];

    for (const file of files) {
      const filename = file.originalname;
      const settings = new Settings(req.body || {});
      registerUploadSize(file, res);
      /* @ts-ignore */
      const fileContents = await storage.getFileContents(file.key);

      if (filename.match(/.html$/)) {
        const d = await PrepareDeck(
          filename,
          [{ name: filename, contents: fileContents }],
          settings
        );
        if (d) {
          const pkg = new Package(d.name, d.apkg);
          packages = packages.concat(pkg);
        }
      } else {
        const zipHandler = new ZipHandler();
        /* @ts-ignore */
        await zipHandler.build(fileContents, res.locals.patreon);
        for (const fileName of zipHandler.getFileNames()) {
          if (fileName.match(/.html$/) && !fileName.includes('/')) {
            const d = await PrepareDeck(fileName, zipHandler.files, settings);
            if (d) {
              packages.push(new Package(d.name, d.apkg));
            }
          }
        }
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
        /* @ts-ignore */
        captureException(err.toString());
        console.info(`failed to set name ${first.name}`);
      }

      // Persisting the deck to spaces
      try {
        await storage.uploadFile(
          storage.uniqify(first.name, 'apkg', 255, 'apkg'),
          first.apkg
        );
      } catch (err) {
        captureException(err);
      }

      res.attachment(`/${first.name}`);
      res.status(200).send(payload);
    } else if (packages.length > 1) {
      sendBundle(packages, storage, res);
    } else {
      throw NO_PACKAGE_ERROR;
    }
  } catch (err) {
    captureException(err);
    ErrorHandler(res, err as Error);
  }
}
