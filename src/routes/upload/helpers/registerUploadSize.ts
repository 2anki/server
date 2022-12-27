import { captureException } from '@sentry/node';
import { Response } from 'express';
import { BytesToMegaBytes } from '../../../lib/misc/file';
import DB from '../../../lib/storage/db';
import { UploadedFile } from '../../../lib/storage/types';

export const registerUploadSize = async (file: UploadedFile, res: Response) => {
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
    captureException(error);
  }
};
