import DB from '../lib/storage/db';
import Favorites, { FavoritesInitializer } from '../schemas/public/Favorites';

export class FavoritesRepository {
  table: string;

  constructor() {
    this.table = 'favorites';
  }

  getAll(owner: number): Promise<Favorites[]> {
    return DB(this.table).select('*').where({
      owner,
    });
  }

  async create({ object_id, owner, type }: FavoritesInitializer) {
    await DB(this.table).insert({
      object_id,
      owner,
      type,
    });
  }

  async remove(id: string, owner: number) {
    await DB(this.table).delete().where({
      object_id: id,
      owner,
    });
  }
}
