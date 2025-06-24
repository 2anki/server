import express from 'express';
import ConversionJob from '../ConversionJob';

import StorageHandler from '../../StorageHandler';
import { notifyUserIfNecessary } from './notifyUserIfNecessary';
import { Knex } from 'knex';
import NotionAPIWrapper from '../../../../services/NotionService/NotionAPIWrapper';
import { isPaying } from '../../../isPaying';

interface ConversionRequest {
  title: string | null;
  api: NotionAPIWrapper;
  id: string;
  owner: string;
  res: express.Response | null;
  type?: string;
}

export default async function performConversion(
  database: Knex,
  { title, api, id, owner, res, type }: ConversionRequest
) {
  let waitingResponse = true;
  console.log(`Performing conversion for ${id}`);

  const storage = new StorageHandler();
  const job = new ConversionJob(database);

  await job.load(id, owner, title, type);
  try {
    if (!job.canStart()) {
      console.log(`job ${id} was not started. Job is already active.`);
      return res ? res.redirect('/uploads') : null;
    }

    const jobs = await database('jobs').where({ owner }).returning(['*']);
    if (!isPaying(res?.locals) && jobs.length > 1) {
      await job.cancelled(
        'You have reached the limit of free jobs. Max 1 at a time.'
      );
      return res ? res.redirect('/uploads') : null;
    }

    console.log(`job ${id} is not active, starting`);
    await job.start();

    // Note user is getting a response but the job is still running
    if (res) {
      waitingResponse = false;
      res.status(200).send();
    }

    const { ws, exporter, settings, bl, rules } =
      await job.createWorkSpace(api);
    const decks = await job.createFlashcards(bl, id, rules, settings, type);
    if (!decks) {
      await job.failed(
        'No decks created, please try again or contact support with' +
          id +
          '.' +
          job.raw?.id
      );
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
      db: database,
      size,
      key,
      id,
      apkg,
    });
    await job.completed();
  } catch (error) {
    await job.failed('Technical error ' + error);
    if (waitingResponse) {
      res?.status(400).send('conversion failed.');
    }
    console.error(error);
  }
}
