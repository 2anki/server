import express from 'express';
import ConversionJob from '../ConversionJob';

import NotionAPIWrapper from '../../../notion/NotionAPIWrapper';
import DB from '../../db';
import StorageHandler from '../../StorageHandler';
import { captureException } from '@sentry/node';
import { notifyUserIfNecessary } from './notifyUserIfNecessary';

export default async function performConversion(
  api: NotionAPIWrapper,
  id: string,
  owner: string,
  req: express.Request | null,
  res: express.Response | null
) {
  console.log(`Performing conversion for ${id}`);
  const storage = new StorageHandler();
  const job = new ConversionJob(DB);
  await job.load(id, owner);
  try {
    if (job.isActive()) {
      console.log(`job ${id} is already active`);
      return res ? res.status(200).send() : null;
    }

    console.log(`job ${id} is not active, starting`);
    await job.start();

    if (res) {
      res.status(200).send();
    }

    const { ws, exporter, settings, bl, rules } = await job.createWorkSpace(
      api,
      res
    );
    const decks = await job.createFlashcards(bl, req, id, rules, settings);
    if (!decks) {
      return await job.failed();
    }
    const { size, key, apkg } = await job.buildingDeck(
      bl,
      exporter,
      decks,
      ws,
      settings,
      storage,
      id,
      owner
    );
    await notifyUserIfNecessary({
      owner,
      rules,
      job,
      db: DB,
      size,
      key,
      id,
      apkg,
    });
  } catch (error) {
    await job.failed();
    console.error(error);
    captureException(error);
  }
}
