import { Knex } from 'knex';
import Jobs from './public/Jobs';

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

  create(id: string, owner: string, title?: string | null, type?: string) {
    return this.database(this.tableName).insert({
      type,
      title,
      object_id: id,
      owner,
      status: 'started',
      last_edited_time: new Date(),
    });
  }

  findJobById(id: string, owner: string) {
    return this.database(this.tableName)
      .where({ object_id: id, owner })
      .returning('*')
      .first();
  }

  async updateJobStatus(
    id: string,
    owner: string,
    status: string,
    description?: string
  ): Promise<Jobs> {
    const rows = await this.database(this.tableName)
      .where({ object_id: id, owner })
      .update({
        status,
        job_reason_failure: description,
        last_edited_time: new Date(),
      })
      .returning('*');
    return rows[0] as Jobs;
  }
}

export default JobRepository;
