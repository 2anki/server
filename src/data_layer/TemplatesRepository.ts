import { Knex } from 'knex';

import { TemplatesInitializer } from './public/Templates';

class TemplatesRepository {
  private table = 'templates';

  constructor(private readonly database: Knex) {}

  create({ owner, payload }: TemplatesInitializer) {
    return this.database(this.table)
      .insert({
        owner,
        payload: JSON.stringify(payload),
      })
      .onConflict('owner')
      .merge();
  }

  async findByOwner(owner: number | string) {
    const row = await this.database(this.table).where({ owner }).first();
    return row?.payload ?? null;
  }

  delete(owner: number | string) {
    return this.database(this.table).del().where({ owner });
  }
}

export default TemplatesRepository;
