import { Knex } from 'knex';
import Favorites, { FavoritesInitializer } from './public/Favorites';

export class FavoritesRepository {
  table: string;

  constructor(private readonly database: Knex) {
    this.table = 'favorites';
  }

  getAll(owner: number): Promise<Favorites[]> {
    return this.database(this.table).select('*').where({
      owner,
    });
  }

  create({ object_id, owner, type }: FavoritesInitializer) {
    return this.database(this.table).insert({
      object_id,
      owner,
      type,
    });
  }

  async remove(id: string, owner: number) {
    await this.database(this.table).delete().where({
      object_id: id,
      owner,
    });
  }

  deleteAll(owner: number | string) {
    return this.database('favorites').delete().where({
      owner,
    });
  }
}
