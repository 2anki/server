import { Knex } from 'knex';

import Favorites from './public/Favorites';
import { NewFavorite } from '../entities/favorites';

export class FavoritesRepository {
  table: string;

  constructor(private readonly database: Knex) {
    this.table = 'favorites';
  }

  getAllByOwner(owner: string): Promise<Favorites[]> {
    return this.database(this.table).select('*').where({
      owner,
    });
  }

  addToFavorites({ object_id, owner, type }: NewFavorite) {
    return this.database(this.table).insert({
      object_id,
      owner,
      type,
    });
  }

  async remove(id: string, owner: string | number) {
    await this.database(this.table).delete().where({
      object_id: id,
      owner,
    });
  }

  findById(id: string): Promise<Favorites> {
    return this.database(this.table)
      .select('*')
      .where({
        object_id: id,
      })
      .first();
  }
}
