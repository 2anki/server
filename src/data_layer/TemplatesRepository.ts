import { Knex } from 'knex';

import DB from '../lib/storage/db';
import { TemplatesInitializer } from '../schemas/public/Templates';

class TemplatesRepository {
  private database: Knex;

  private table = 'templates';

  constructor() {
    this.database = DB;
  }

  create({ owner, payload }: TemplatesInitializer) {
    return this.database(this.table)
      .insert({
        owner: owner,
        payload: JSON.stringify(payload),
      })
      .onConflict('owner')
      .merge();
  }

  delete(owner: number | string) {
    return this.database(this.table).del().where({ owner });
  }
}

export default TemplatesRepository;
