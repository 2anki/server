import { Response } from 'express';
import { nanoid } from 'nanoid';

import { ZipHandler } from '../../../lib/anki/zip';
import Package from '../../../lib/parser/Package';
import StorageHandler from '../../../lib/storage/StorageHandler';
import cleanDeckName from './cleanDeckname';
import loadREADME from './loadREADME';
import { sendError } from '../../../lib/error/sendError';

const setFilename = (res: Response, filename: string) => {
  try {
    res.set('File-Name', cleanDeckName(filename));
  } catch (err) {
    sendError(err);
  }
};

export const sendBundle = async (
  packages: Package[],
  storage: StorageHandler,
  res: Response
) => {
  const filename = `Your decks-${nanoid()}.zip`;
  const payload = await ZipHandler.toZip(packages, loadREADME());
  setFilename(res, filename);
  res.status(200).send(payload);
};
