import { Knex } from 'knex';
import Settings, { SettingsInitializer } from './public/Settings';

class SettingsRepository {
  table: string;

  constructor(private readonly database: Knex) {
    this.table = 'settings';
  }

  create({ owner, object_id, payload, title }: SettingsInitializer) {
    return this.database(this.table)
      .insert({
        owner,
        object_id,
        payload,
        title,
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

  getAllByOwner(owner: string): Promise<Pick<Settings, 'object_id' | 'title' | 'updated_at'>[]> {
    return this.database(this.table)
      .select('object_id', 'title', 'updated_at')
      .where({ owner })
      .orderBy('updated_at', 'desc');
  }

  updateTitle(object_id: string, title: string): Promise<void> {
    return this.database(this.table)
      .where({ object_id })
      .update({ title });
  }

  deleteAllByOwner(owner: string): Promise<number> {
    return this.database(this.table).where({ owner }).del();
  }
}

export default SettingsRepository;
