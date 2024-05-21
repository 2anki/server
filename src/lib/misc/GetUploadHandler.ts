import express from 'express';
import multer from 'multer';
import { getUploadLimits } from './getUploadLimits';
import { getMaxUploadCount } from './getMaxUploadCount';

export const getUploadHandler = (res: express.Response) => {
  const maxUploadCount = getMaxUploadCount({
    patreon: res.locals.patreon,
    subscriber: res.locals.subscriber,
  });

  return multer({
    limits: getUploadLimits({
      patron: res.locals.patreon,
      subscriber: res.locals.subscriber,
    }),
    dest: process.env.UPLOAD_BASE,
  }).array('pakker', maxUploadCount);
};
