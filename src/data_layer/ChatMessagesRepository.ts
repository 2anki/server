import type { Knex } from 'knex';

export interface ChatMessageRow {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

export interface IChatMessagesRepository {
  insert(entry: { userId: number; role: 'user' | 'assistant'; content: string }): Promise<void>;
  countThisMonth(userId: number): Promise<number>;
}

export class ChatMessagesRepository implements IChatMessagesRepository {
  private readonly table = 'chat_messages';

  constructor(private readonly database: Knex) {}

  async insert(entry: { userId: number; role: 'user' | 'assistant'; content: string }): Promise<void> {
    await this.database(this.table).insert({
      user_id: entry.userId,
      role: entry.role,
      content: entry.content,
    });
  }

  async countThisMonth(userId: number): Promise<number> {
    const firstOfMonth = new Date();
    firstOfMonth.setUTCDate(1);
    firstOfMonth.setUTCHours(0, 0, 0, 0);

    const result = await this.database(this.table)
      .where('user_id', userId)
      .where('created_at', '>=', firstOfMonth)
      .count<{ count: string }>('* as count')
      .first();

    return Number(result?.count ?? 0);
  }
}

export class InMemoryChatMessagesRepository implements IChatMessagesRepository {
  private readonly rows: Array<{
    id: number;
    user_id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: Date;
  }> = [];
  private nextId = 1;

  async insert(entry: { userId: number; role: 'user' | 'assistant'; content: string }): Promise<void> {
    this.rows.push({
      id: this.nextId++,
      user_id: entry.userId,
      role: entry.role,
      content: entry.content,
      created_at: new Date(),
    });
  }

  async countThisMonth(userId: number): Promise<number> {
    const firstOfMonth = new Date();
    firstOfMonth.setUTCDate(1);
    firstOfMonth.setUTCHours(0, 0, 0, 0);

    return this.rows.filter(
      (r) => r.user_id === userId && r.created_at >= firstOfMonth
    ).length;
  }

  getAll(): typeof this.rows {
    return this.rows;
  }
}
