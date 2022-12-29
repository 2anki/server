import { Knex } from 'knex';

import performConversion from './helpers/performConversion';
import TokenHandler from '../../misc/TokenHandler';
import NotionAPIWrapper from '../../notion/NotionAPIWrapper';
import { Job, JobStatus } from '../types';
import { captureException } from '@sentry/node';
import Workspace from '../../parser/WorkSpace';
import CustomExporter from '../../parser/CustomExporter';
import { loadSettingsFromDatabase } from '../../parser/Settings/loadSettingsFromDatabase';
import DB from '../db';
import BlockHandler from '../../notion/BlockHandler/BlockHandler';
import ParserRules from '../../parser/ParserRules';
import isPatron from '../../User/isPatron';
import express from 'express';
import Settings from '../../parser/Settings';
import CardGenerator from '../../anki/CardGenerator';
import fs from 'fs';
import {
  addDeckNameSuffix,
  DECK_NAME_SUFFIX,
  isValidDeckName,
} from '../../anki/format';
import { FileSizeInMegaBytes } from '../../misc/file';
import Deck from '../../parser/Deck';
import StorageHandler from '../StorageHandler';

export default class ConversionJob {
  db: Knex;

  raw?: Job;

  constructor(db: Knex) {
    this.db = db;
  }

  findJob(id: string, owner: string) {
    return this.db('jobs')
      .where({ object_id: id, owner })
      .returning('*')
      .first();
  }

  createJob(id: string, owner: string) {
    return this.db('jobs').insert({
      object_id: id,
      owner,
      status: 'started',
      last_edited_time: new Date(),
    });
  }

  async load(object_id: string, owner: string) {
    let record = await this.findJob(object_id, owner);
    if (!record) {
      await this.createJob(object_id, owner);
      record = await this.findJob(object_id, owner);
    }
    this.raw = record as Job;
  }

  isActive() {
    return this.raw?.status === 'started';
  }

  async setStatus(status: JobStatus) {
    if (!this.raw) {
      return false;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { object_id, owner } = this.raw!;
      await this.db('jobs')
        .insert({
          object_id,
          owner,
          status,
          last_edited_time: new Date(),
        })
        .onConflict('object_id')
        .merge();
      return true;
    } catch (error) {
      console.error(error);
      captureException(error);
    }
  }

  start() {
    return this.setStatus('started');
  }

  completed() {
    return this.setStatus('completed');
  }

  async resume() {
    const job = this.raw;
    if (!job) {
      throw new Error('Invalid job');
    }
    try {
      const token = await TokenHandler.GetNotionToken(job.owner);
      const api = new NotionAPIWrapper(token!);
      await performConversion(api, job.object_id, job.owner, null, null);
    } catch (error) {
      await new ConversionJob(DB).load(job.object_id, job.owner);
    }
  }

  failed() {
    return this.setStatus('failed');
  }

  async createWorkSpace(api: NotionAPIWrapper, res: express.Response | null) {
    await this.setStatus('step1_create_workspace');
    if (!this.raw) {
      await this.failed();
      throw new Error('undefined job');
    }

    const { owner, object_id: id } = this.raw;
    const ws = new Workspace(true, 'fs');
    console.debug(`using workspace ${ws.location}`);
    const exporter = new CustomExporter('', ws.location);
    const settings = await loadSettingsFromDatabase(DB, owner, id);
    const bl = new BlockHandler(exporter, api, settings);
    const rules = await ParserRules.Load(owner, id);

    if (res) {
      bl.useAll = rules.UNLIMITED = res?.locals.patreon;
    } else {
      const user = await isPatron(DB, owner);
      console.log('checking if user is patreon', user);
      bl.useAll = rules.UNLIMITED = user.patreon;
    }

    return { ws, exporter, settings, bl, rules };
  }

  createFlashcards = async (
    bl: BlockHandler,
    req: express.Request | null,
    id: string,
    rules: ParserRules,
    settings: Settings
  ) => {
    await this.setStatus('step2_creating_flashcards');
    try {
      const decks = await bl.findFlashcards({
        parentType: req?.query.type?.toString() || 'page',
        topLevelId: id.replace(/\-/g, ''),
        rules,
        decks: [],
        parentName: settings.deckName || '',
      });
      return decks;
    } catch (error) {
      await this.failed();
      return undefined;
    }
  };

  buildingDeck = async (
    bl: BlockHandler,
    exporter: CustomExporter,
    decks: Deck[],
    ws: Workspace,
    settings: Settings,
    storage: StorageHandler,
    id: string,
    owner: string
  ) => {
    exporter.configure(decks);
    const gen = new CardGenerator(ws.location);
    const payload = (await gen.run()) as string;
    const apkg = fs.readFileSync(payload);
    const filename = (() => {
      const f = settings.deckName || bl.firstPageTitle || id;
      if (isValidDeckName(f)) {
        return f;
      }
      return addDeckNameSuffix(f);
    })();

    const key = storage.uniqify(id, owner, 200, DECK_NAME_SUFFIX);
    await storage.uploadFile(key, apkg);
    const size = FileSizeInMegaBytes(payload);
    await DB('uploads').insert({
      object_id: id,
      owner,
      filename,
      key,
      size_mb: size,
    });
    return { size, key, apkg };
  };
}
