import { Request, Response } from 'express';

import StorageHandler from '../../lib/storage/StorageHandler';
import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';
import { purgeBlockCache } from './purgeBlockCache';

export default async function deleteUpload(req: Request, res: Response) {
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
    await s.deleteWith(key);
    console.log('done deleting', key);
  } catch (error) {
    sendError(error);
    return res.status(500).send();
  }
  return res.status(200).send();
}
