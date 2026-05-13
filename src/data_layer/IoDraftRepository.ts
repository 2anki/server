import type { Knex } from 'knex';

export interface IoDraftRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface IoDraftImage {
  s3Key: string;
  imageName: string;
  header: string;
  rects: IoDraftRect[];
}

export interface IoDraftRow {
  id: string;
  user_id: number;
  deck_name: string;
  mode: string;
  images: IoDraftImage[];
  updated_at: Date;
}

export interface IIoDraftRepository {
  upsert(userId: number, deckName: string, mode: string, images: IoDraftImage[]): Promise<void>;
  findByUser(userId: number): Promise<IoDraftRow | null>;
  deleteByUser(userId: number): Promise<void>;
}

export class IoDraftRepository implements IIoDraftRepository {
  private readonly table = 'io_drafts';

  constructor(private readonly database: Knex) {}

  async upsert(userId: number, deckName: string, mode: string, images: IoDraftImage[]): Promise<void> {
    await this.database(this.table)
      .insert({
        user_id: userId,
        deck_name: deckName,
        mode,
        images: JSON.stringify(images),
        updated_at: new Date(),
      })
      .onConflict(['user_id'])
      .merge(['deck_name', 'mode', 'images', 'updated_at']);
  }

  async findByUser(userId: number): Promise<IoDraftRow | null> {
    const row = await this.database<IoDraftRow>(this.table)
      .where({ user_id: userId })
      .first();
    return row ?? null;
  }

  async deleteByUser(userId: number): Promise<void> {
    await this.database(this.table).where({ user_id: userId }).delete();
  }
}
