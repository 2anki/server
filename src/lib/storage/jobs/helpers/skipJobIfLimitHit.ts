import express from 'express';
import { getAllStartedJobs } from './getAllStartedJobs.js';
import DB from '../../db';

export async function skipJobIfLimitHit(
  owner: string,
  res: express.Response | null
) {
  const allJobs = await getAllStartedJobs(DB, owner);
  console.log('user has jobs', allJobs.length);
  if (allJobs.length === 1 && !res?.locals.patreon) {
    console.log('skipping conversion');
    return res?.status(429).send({
      message:
        'Request denied, only patrons are allowed to make multiple conversions at a time. You already have a conversion in progress. Wait for your current conversion to finish or cancel it under Uploads.',
    });
  }
  return false;
}
