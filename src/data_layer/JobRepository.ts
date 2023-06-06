import { Knex } from 'knex';

class JobRepository {
  tableName = 'jobs';

  constructor(private readonly database: Knex) {}

  getJobsByOwner(owner: string) {
    return this.database(this.tableName).where({ owner }).returning(['*']);
  }

  deleteJob(id: string, owner: string) {
    return this.database(this.tableName).delete().where({
      id: id,
      owner: owner,
    });
  }
}

export default JobRepository;
