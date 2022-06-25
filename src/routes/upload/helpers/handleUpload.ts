import { nanoid } from 'nanoid';
import express from 'express';

import StorageHandler from '../../../lib/storage/StorageHandler';
import { PrepareDeck } from '../../../lib/parser/DeckParser';
import { BytesToMegaBytes } from '../../../lib/misc/file';
import Settings from '../../../lib/parser/Settings';
import { ZipHandler } from '../../../lib/anki/zip';
import ErrorHandler from '../../../lib/misc/ErrorHandler';
import Package from '../../../lib/parser/Package';
import cleanDeckName from './cleanDeckname';
import DB from '../../../lib/storage/db';
import loadREADME from './loadREADME';

export default async function handleUpload(
  storage: StorageHandler,
  req: express.Request,
  res: express.Response
) {
  const isLoggedIn = res.locals.owner;

  try {
    const files = req.files as Express.Multer.File[];
    let packages: Package[] = [];

    for (const file of files) {
      const filename = file.originalname;
      const settings = new Settings(req.body || {});
      if (isLoggedIn) {
        try {
          await DB('uploads').insert({
            owner: res.locals.owner,
            filename,
            /* @ts-ignore */
            key: file.key,
            size_mb: BytesToMegaBytes(file.size),
          });
        } catch (error) {
          console.info('failed to register upload');
          console.error(error);
        }
      }

      /* @ts-ignore */
      const fileContents = await storage.getFileContents(file.key);

      if (filename.match(/.html$/)) {
        const d = await PrepareDeck(
          filename,
          [{ name: filename, contents: fileContents }],
          settings
        );
        const pkg = new Package(d.name, d.apkg);
        packages = packages.concat(pkg);
      } else {
        const zipHandler = new ZipHandler();
        /* @ts-ignore */
        await zipHandler.build(fileContents, res.locals.patreon);
        for (const fileName of zipHandler.getFileNames()) {
          if (fileName.match(/.html$/) && !fileName.includes('/')) {
            const d = await PrepareDeck(fileName, zipHandler.files, settings);
            packages.push(new Package(d.name, d.apkg));
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
        res.set('File-Name', first.name);
      } catch (err) {
        /* @ts-ignore */
        console.error(err.toString());
        console.info(`failed to set name ${first.name}`);
      }

      // Persisting the deck to spaces
      try {
        await storage.uploadFile(
          storage.uniqify(first.name, 'apkg', 255, 'apkg'),
          first.apkg
        );
      } catch (err) {
        console.error('failed to upload to spaces', err);
      }

      res.attachment(`/${first.name}`);
      res.status(200).send(payload);
    } else if (packages.length > 1) {
      const filename = `Your decks-${nanoid()}.zip`;
      const ws = process.env.WORKSPACE_BASE;
      if (!ws) {
        throw new Error('Missing workspace value');
      }
      payload = await ZipHandler.toZip(packages, loadREADME());
      for (const pkg of packages) {
        try {
          await storage.uploadFile(
            storage.uniqify(pkg.name, 'apkg', 255, 'apkg'),
            pkg.apkg
          );
        } catch (err) {
          console.debug(`failed to upload to spaces ${err}`);
        }
      }
      try {
        res.set('File-Name', cleanDeckName(filename));
      } catch (err) {
        console.debug('failed to set name ***');
      }
      res.status(200).send(payload);
    } else {
      throw new Error(
        'Could not create any cards. Did you write any togglelists?'
      );
    }
  } catch (err) {
    console.error(err);
    ErrorHandler(res, err as Error);
  }
}
