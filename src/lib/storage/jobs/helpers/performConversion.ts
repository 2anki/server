import express from 'express';
import ConversionJob from '../ConversionJob';

import NotionAPIWrapper from '../../../notion/NotionAPIWrapper';
import DB from '../../db';
import StorageHandler from '../../StorageHandler';
import { notifyUserIfNecessary } from './notifyUserIfNecessary';
import { sendError } from '../../../error/sendError';

interface ConversionRequest {
  title: string | null;
  api: NotionAPIWrapper;
  id: string;
  owner: string;
  req: express.Request | null;
  res: express.Response | null;
}

export default async function performConversion({
  title,
  api,
  id,
  owner,
  req,
  res,
}: ConversionRequest) {
  console.log(`Performing conversion for ${id}`);
  const storage = new StorageHandler();
  const job = new ConversionJob(DB);
  await job.load(id, owner, title);
  try {
    if (!job.canStart()) {
      console.log(`job ${id} was not started`);
      return res
        ? res.status(405).send({ message: 'Job is already active' })
        : null;
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
      db: DB,
      size,
      key,
      id,
      apkg,
    });
    await job.completed();
  } catch (error) {
    sendError(error);
    await job.failed();
  }
}
