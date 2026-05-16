import type { Knex } from 'knex';

export interface EventRow {
  name: string;
  user_id?: number | null;
  anonymous_id?: string | null;
  props: Record<string, unknown>;
  created_at?: Date;
}

export interface EventCountRow {
  count: number;
}

export interface IEventsRepository {
  insertEvents(rows: EventRow[]): Promise<void>;
  countByName(name: string, since: Date): Promise<number>;
  countDistinctUsers(name: string, since: Date): Promise<number>;
  countByNameForUser(
    name: string,
    since: Date,
    userId: number | null,
    anonymousId: string | null
  ): Promise<number>;
}

export class EventsRepository implements IEventsRepository {
  private readonly table = 'events';

  constructor(private readonly database: Knex) {}

  async insertEvents(rows: EventRow[]): Promise<void> {
    if (rows.length === 0) return;
    await this.database(this.table).insert(rows);
  }

  async countByName(name: string, since: Date): Promise<number> {
    const result = await this.database(this.table)
      .where('name', name)
      .where('created_at', '>=', since)
      .count('id as count')
      .first();
    return Number(result?.count ?? 0);
  }

  async countDistinctUsers(name: string, since: Date): Promise<number> {
    const result = await this.database(this.table)
      .where('name', name)
      .where('created_at', '>=', since)
      .whereNotNull('user_id')
      .countDistinct('user_id as count')
      .first();
    return Number(result?.count ?? 0);
  }

  async countByNameForUser(
    name: string,
    since: Date,
    userId: number | null,
    anonymousId: string | null
  ): Promise<number> {
    const query = this.database(this.table)
      .where('name', name)
      .where('created_at', '>=', since);

    if (userId != null) {
      query.where('user_id', userId);
    } else if (anonymousId != null) {
      query.where('anonymous_id', anonymousId);
    } else {
      return 0;
    }

    const result = await query.count('id as count').first();
    return Number(result?.count ?? 0);
  }
}

export default EventsRepository;
