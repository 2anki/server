import { Knex } from 'knex';
import DB from '../lib/storage/db';
import { SettingsInitializer } from '../schemas/public/Settings';

class SettingsRepository {
  database: Knex;

  table: string;

  constructor() {
    this.table = 'settings';
    this.database = DB;
  }

  create({ owner, object_id, payload }: SettingsInitializer) {
    return this.database(this.table)
      .insert({
        owner,
        object_id,
        payload,
      })
      .onConflict('object_id')
      .merge();
  }

  delete(owner: number | string, object_id: string) {
    return this.database(this.table).del().where({ owner, object_id });
  }

  getById(object_id: string) {
    return this.database(this.table)
      .where({ object_id })
      .returning(['payload'])
      .first();
  }
}

export default SettingsRepository;
