import type { Knex } from 'knex';

import type { ShowcaseBlockPayload } from '../usecases/ops/PopulateShowcaseUseCase';
import type { RenderedCard } from '../services/ApkgPreviewService/types';

export interface ShowcaseRow {
  pageTitle: string;
  notionBlocks: ShowcaseBlockPayload[];
  ankiCards: RenderedCard[];
  populatedAt: Date;
}

export interface IShowcaseRepository {
  get(): Promise<ShowcaseRow | null>;
  upsert(data: ShowcaseRow): Promise<void>;
  purge(): Promise<void>;
}

interface ShowcaseDbRow {
  id: number;
  page_title: string;
  notion_blocks: ShowcaseBlockPayload[];
  anki_cards: RenderedCard[];
  populated_at: Date | string;
}

export class ShowcaseRepository implements IShowcaseRepository {
  private readonly table = 'homepage_showcase';

  constructor(private readonly database: Knex) {}

  async get(): Promise<ShowcaseRow | null> {
    const row = await this.database<ShowcaseDbRow>(this.table)
      .where('id', 1)
      .first();
    if (row == null) return null;
    return {
      pageTitle: row.page_title,
      notionBlocks: row.notion_blocks,
      ankiCards: row.anki_cards,
      populatedAt: new Date(row.populated_at),
    };
  }

  async upsert(data: ShowcaseRow): Promise<void> {
    await this.database(this.table)
      .insert({
        id: 1,
        page_title: data.pageTitle,
        notion_blocks: JSON.stringify(data.notionBlocks),
        anki_cards: JSON.stringify(data.ankiCards),
        populated_at: data.populatedAt,
      })
      .onConflict('id')
      .merge();
  }

  async purge(): Promise<void> {
    await this.database(this.table).where('id', 1).delete();
  }
}

export class InMemoryShowcaseRepository implements IShowcaseRepository {
  private row: ShowcaseRow | null = null;

  async get(): Promise<ShowcaseRow | null> {
    return this.row ? { ...this.row } : null;
  }

  async upsert(data: ShowcaseRow): Promise<void> {
    this.row = { ...data };
  }

  async purge(): Promise<void> {
    this.row = null;
  }
}
