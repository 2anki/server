import type { Knex } from 'knex';

interface EmojiFeedbackEntry {
  rating: number;
  comment: string | null;
  page: string;
}

export interface IEmojiFeedbackRepository {
  insert(entry: EmojiFeedbackEntry): Promise<void>;
}

export class EmojiFeedbackRepository implements IEmojiFeedbackRepository {
  private readonly table = 'emoji_feedback';

  constructor(private readonly database: Knex) {}

  async insert(entry: EmojiFeedbackEntry): Promise<void> {
    await this.database(this.table).insert({
      rating: entry.rating,
      comment: entry.comment,
      page: entry.page,
    });
  }
}
