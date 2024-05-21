import express from 'express';
import multer from 'multer';
import { getUploadLimits } from './getUploadLimits';
import { getMaxUploadCount } from './getMaxUploadCount';
import { isPaying } from '../isPaying';

export const getUploadHandler = (res: express.Response) => {
  const paying = isPaying(res.locals);
  const maxUploadCount = getMaxUploadCount(paying);

  return multer({
    limits: getUploadLimits(paying),
    dest: process.env.UPLOAD_BASE,
  }).array('pakker', maxUploadCount);
};
