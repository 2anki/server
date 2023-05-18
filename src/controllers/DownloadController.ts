import { Request, Response } from 'express';

import DB from '../lib/storage/db';
import StorageHandler from '../lib/storage/StorageHandler';
import { AWSError } from 'aws-sdk';
import { sendError } from '../lib/error/sendError';

const getFile = async (req: Request, res: Response) => {
  const storage = new StorageHandler();
  const { key } = req.params;

  if (!key) {
    console.info('no key');
    return res.status(400).send();
  }

  console.debug(`download ${key}`);
  const { owner } = res.locals;
  const query = { key, owner };
  try {
    const match = await DB('uploads').where(query).returning(['key']).first();
    if (match) {
      const file = await storage.getFileContents(match.key);
      res.send(file.Body);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    console.error(error);
    console.info('unknown error');
    if ((error as AWSError).name.match(/NoSuchKey/)) {
      await DB('uploads').where(query).delete();
      return res.redirect('/uploads');
    }
    res.status(404).send();
    sendError(error);
  }
};

const DownloadController = { getFile };

export default DownloadController;
