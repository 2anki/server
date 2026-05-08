import { Knex } from 'knex';

import {
  AnkifySyncMapping,
  NewAnkifySyncMapping,
} from '../../entities/ankify';

const TABLE = 'ankify_sync_mappings';

export interface AnkifySyncMappingsRepositoryInterface {
  findBySourceId(
    ankifyClientId: number,
    sourceId: string
  ): Promise<AnkifySyncMapping | null>;
  upsert(input: NewAnkifySyncMapping): Promise<AnkifySyncMapping>;
  listByClient(ankifyClientId: number): Promise<AnkifySyncMapping[]>;
  findByAnkiNoteId(
    ankifyClientId: number,
    ankiNoteId: number
  ): Promise<AnkifySyncMapping | null>;
  deleteByAnkiNoteId(
    ankifyClientId: number,
    ankiNoteId: number
  ): Promise<void>;
}

export class AnkifySyncMappingsRepository
  implements AnkifySyncMappingsRepositoryInterface
{
  constructor(private readonly database: Knex) {}

  async findBySourceId(
    ankifyClientId: number,
    sourceId: string
  ): Promise<AnkifySyncMapping | null> {
    const row = await this.database<AnkifySyncMapping>(TABLE)
      .select('*')
      .where({ ankify_client_id: ankifyClientId, source_id: sourceId })
      .first();
    return row ?? null;
  }

  async upsert(input: NewAnkifySyncMapping): Promise<AnkifySyncMapping> {
    const [row] = await this.database<AnkifySyncMapping>(TABLE)
      .insert({
        ankify_client_id: input.ankify_client_id,
        source_id: input.source_id,
        source_type: input.source_type,
        anki_note_id: input.anki_note_id,
        deck_name: input.deck_name,
        last_synced_at: this.database.fn.now() as unknown as Date,
      })
      .onConflict(['ankify_client_id', 'source_id'])
      .merge({
        anki_note_id: input.anki_note_id,
        deck_name: input.deck_name,
        last_synced_at: this.database.fn.now() as unknown as Date,
      })
      .returning('*');
    return row;
  }

  listByClient(ankifyClientId: number): Promise<AnkifySyncMapping[]> {
    return this.database<AnkifySyncMapping>(TABLE)
      .select('*')
      .where({ ankify_client_id: ankifyClientId })
      .orderBy('last_synced_at', 'desc');
  }

  async findByAnkiNoteId(
    ankifyClientId: number,
    ankiNoteId: number
  ): Promise<AnkifySyncMapping | null> {
    const row = await this.database<AnkifySyncMapping>(TABLE)
      .select('*')
      .where({ ankify_client_id: ankifyClientId, anki_note_id: ankiNoteId })
      .first();
    return row ?? null;
  }

  async deleteByAnkiNoteId(
    ankifyClientId: number,
    ankiNoteId: number
  ): Promise<void> {
    await this.database(TABLE)
      .delete()
      .where({ ankify_client_id: ankifyClientId, anki_note_id: ankiNoteId });
  }
}
