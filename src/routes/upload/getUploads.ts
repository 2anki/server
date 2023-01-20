import { Request, Response } from 'express';

import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';

export default async function getUploads(_req: Request, res: Response) {
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
}
