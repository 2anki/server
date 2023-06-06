import { Knex } from 'knex';

import { TemplatesInitializer } from '../schemas/public/Templates';

class TemplatesRepository {
  private table = 'templates';

  constructor(private readonly database: Knex) {}

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
