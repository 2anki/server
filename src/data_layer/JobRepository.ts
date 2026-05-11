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
    return this.database(this.tableName)
      .insert({
        type,
        title,
        object_id: id,
        owner,
        status: 'started',
        last_edited_time: new Date(),
      })
      .onConflict(['object_id', 'owner'])
      .ignore();
  }

  findJobById(id: string, owner: string) {
    return this.database(this.tableName)
      .where({ object_id: id, owner })
      .returning('*')
      .first();
  }

  markInterruptedClaudeJobs() {
    return this.database(this.tableName)
      .whereNotIn('status', ['done', 'failed', 'cancelled', 'interrupted'])
      .where({ type: 'claude' })
      .update({ status: 'interrupted', last_edited_time: new Date() });
  }

  static readonly TERMINAL_STATUSES = ['done', 'failed', 'cancelled', 'interrupted'];

  async updateJobStatus(
    id: string,
    owner: string,
    status: string,
    description?: string
  ): Promise<Jobs> {
    const isTerminal = JobRepository.TERMINAL_STATUSES.includes(status);
    const query = this.database(this.tableName).where({ object_id: id, owner });
    if (!isTerminal) {
      query.whereNotIn('status', JobRepository.TERMINAL_STATUSES);
    }
    const rows = await query
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
