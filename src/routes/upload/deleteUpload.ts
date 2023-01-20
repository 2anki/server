import { Request, Response } from 'express';

import StorageHandler from '../../lib/storage/StorageHandler';
import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';

export default async function deleteUpload(req: Request, res: Response) {
  const { key } = req.params;
  console.log('delete', key);
  if (!key) {
    return res.status(400).send();
  }
  try {
    await DB('uploads').del().where({ owner: res.locals.owner, key });
    const s = new StorageHandler();
    await s.deleteWith(key);
    console.log('done deleting', key);
  } catch (error) {
    sendError(error);
    return res.status(500).send();
  }
  return res.status(200).send();
}
