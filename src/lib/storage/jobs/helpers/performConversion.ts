import express from 'express';
import ConversionJob from '../ConversionJob';

import NotionAPIWrapper from '../../../notion/NotionAPIWrapper';
import DB from '../../db';
import StorageHandler from '../../StorageHandler';
import { notifyUserIfNecessary } from './notifyUserIfNecessary';
import { getLimitMessage } from '../../../misc/getLimitMessage';

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
  try {
    console.log(`Performing conversion for ${id}`);

    const storage = new StorageHandler();
    const job = new ConversionJob(DB);
    await job.load(id, owner, title);
    if (!job.canStart()) {
      console.log(`job ${id} was not started. Job is already active.`);
      return res ? res.redirect('/uploads') : null;
    }
    const jobs = await DB('jobs').where({ owner }).returning(['*']);
    if (!res?.locals.patreon && jobs.length > 1) {
      await job.cancelled();
      return res ? res.status(500).send(getLimitMessage()) : null;
    }

    console.log(`job ${id} is not active, starting`);
    await job.start();

    if (res) {
      res.status(200).send();
    }

    const { ws, exporter, settings, bl, rules } = await job.createWorkSpace(
      api
    );
    const decks = await job.createFlashcards(bl, req, id, rules, settings);
    if (!decks) {
      await job.failed();
      return;
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
    res?.status(400).send('conversion failed.');
    console.error(error);
  }
}
