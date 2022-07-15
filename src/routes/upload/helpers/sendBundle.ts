import { captureException } from '@sentry/node';
import { Response } from 'express';
import { nanoid } from 'nanoid';

import { ZipHandler } from '../../../lib/anki/zip';
import Package from '../../../lib/parser/Package';
import StorageHandler from '../../../lib/storage/StorageHandler';
import cleanDeckName from './cleanDeckname';
import loadREADME from './loadREADME';

const setFilename = (res: Response, filename: string) => {
  try {
    res.set('File-Name', cleanDeckName(filename));
  } catch (err) {
    captureException(err);
  }
};

const uploadToSpaces = async (storage: StorageHandler, packages: Package[]) => {
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
};

export const sendBundle = async (
  packages: Package[],
  storage: StorageHandler,
  res: Response
) => {
  uploadToSpaces(storage, packages); // non blocking
  const filename = `Your decks-${nanoid()}.zip`;
  const payload = await ZipHandler.toZip(packages, loadREADME());
  setFilename(res, filename);
  res.status(200).send(payload);
};
