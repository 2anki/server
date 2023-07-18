import { Knex } from 'knex';

import fs from 'fs';
import { getDatabase } from '../../../data_layer';
import BlockHandler from '../../../services/NotionService/BlockHandler/BlockHandler';
import { toText } from '../../../services/NotionService/BlockHandler/helpers/deckNameToText';
import NotionAPIWrapper from '../../../services/NotionService/NotionAPIWrapper';
import CardGenerator from '../../anki/CardGenerator';
import {
  DECK_NAME_SUFFIX,
  addDeckNameSuffix,
  isValidDeckName,
} from '../../anki/format';
import { sendError } from '../../error/sendError';
import { FileSizeInMegaBytes } from '../../misc/file';
import CustomExporter from '../../parser/CustomExporter';
import Deck from '../../parser/Deck';
import ParserRules from '../../parser/ParserRules';
import Settings from '../../parser/Settings';
import { loadSettingsFromDatabase } from '../../parser/Settings/loadSettingsFromDatabase';
import Workspace from '../../parser/WorkSpace';
import StorageHandler from '../StorageHandler';
import { Job, JobStatus } from '../types';

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

  createJob(id: string, owner: string, title?: string | null, type?: string) {
    return this.db('jobs').insert({
      type,
      title,
      object_id: id,
      owner,
      status: 'started',
      last_edited_time: new Date(),
    });
  }

  async load(
    object_id: string,
    owner: string,
    title?: string | null,
    type?: string
  ) {
    let record = await this.findJob(object_id, owner);
    if (!record) {
      await this.createJob(object_id, owner, title, type);
      record = await this.findJob(object_id, owner);
    }
    this.raw = record as Job;
  }

  canStart() {
    return this.raw?.status === 'failed' || this.raw?.status === 'started';
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
      sendError(error);
    }
  }

  start() {
    return this.setStatus('started');
  }

  completed() {
    if (!this.raw) {
      throw new Error('invalid job');
    }
    const { owner, object_id: id } = this.raw;
    if (!owner || !id) {
      throw new Error('Missing owner and / or id');
    }
    return this.db('jobs').where({ owner: owner, object_id: id }).del();
  }

  failed() {
    return this.setStatus('failed');
  }

  cancelled() {
    return this.setStatus('cancelled');
  }

  async createWorkSpace(api: NotionAPIWrapper) {
    await this.setStatus('step1_create_workspace');
    if (!this.raw) {
      await this.failed();
      throw new Error('undefined job');
    }

    const { owner, object_id: id } = this.raw;
    const ws = new Workspace(true, 'fs');
    console.debug(`using workspace ${ws.location}`);
    const exporter = new CustomExporter('', ws.location);
    const settings = await loadSettingsFromDatabase(getDatabase(), owner, id);
    console.debug(`using settings ${JSON.stringify(settings, null, 2)}`);
    const bl = new BlockHandler(exporter, api, settings);
    const rules = await ParserRules.Load(owner, id);
    bl.useAll = rules.UNLIMITED;
    return { ws, exporter, settings, bl, rules };
  }

  createFlashcards = async (
    bl: BlockHandler,
    id: string,
    rules: ParserRules,
    settings: Settings,
    type?: string
  ) => {
    await this.setStatus('step2_creating_flashcards');
    const decks = await bl.findFlashcards({
      parentType: type ?? 'page',
      topLevelId: id.replace(/-/g, ''),
      rules,
      decks: [],
      parentName: settings.deckName || '',
    });
    return decks;
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
    const filename = toText(
      (() => {
        const f = settings.deckName || bl.firstPageTitle || id;
        if (isValidDeckName(f)) {
          return f;
        }
        return addDeckNameSuffix(f);
      })()
    );

    const key = storage.uniqify(id, owner, 200, DECK_NAME_SUFFIX);
    await storage.uploadFile(key, apkg);
    const size = FileSizeInMegaBytes(payload);
    await getDatabase()('uploads').insert({
      object_id: id,
      owner,
      filename,
      key,
      size_mb: size,
    });
    return { size, key, apkg };
  };
}
