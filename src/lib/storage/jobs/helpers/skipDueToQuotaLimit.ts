import express from 'express';
import getQuota from '../../../User/getQuota';
import DB from '../../db';

export const skipDueToQuotaLimit = async (
  owner: string,
  res: express.Response | null
) => {
  const quota = await getQuota(DB, owner);
  if (quota > 21 && !res?.locals.patreon) {
    return res
      ?.status(429)
      .json({ message: 'You have reached your quota max of 21MB' });
  }
  console.log('user quota', quota);
  return false;
};
