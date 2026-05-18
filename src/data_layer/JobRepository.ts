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

  findJobByObjectId(objectId: string): Promise<Pick<Jobs, 'title' | 'created_at'> | undefined> {
    return this.database<Jobs>(this.tableName)
      .where({ object_id: objectId })
      .select('title', 'created_at')
      .first();
  }

  markInterruptedClaudeJobs() {
    return this.database(this.tableName)
      .whereNotIn('status', ['done', 'failed', 'cancelled', 'interrupted'])
      .where({ type: 'claude' })
      .update({ status: 'interrupted', last_edited_time: new Date() });
  }

  markInterruptedNotionJobs() {
    return this.database(this.tableName)
      .whereNotIn('status', ['done', 'failed', 'cancelled', 'interrupted'])
      .whereIn('type', ['page', 'database', 'conversion'])
      .update({ status: 'interrupted', last_edited_time: new Date() });
  }

  static readonly TERMINAL_STATUSES = ['done', 'failed', 'cancelled', 'interrupted'];

  async restartJob(id: string, owner: string): Promise<Jobs> {
    const rows = await this.database(this.tableName)
      .where({ object_id: id, owner })
      .update({
        status: 'started',
        job_reason_failure: '',
        last_edited_time: new Date(),
      })
      .returning('*');
    return rows[0] as Jobs;
  }

  async updateJobStatus(
    id: string,
    owner: string,
    status: string,
    description?: string,
    cardCount?: number
  ): Promise<Jobs> {
    const isTerminal = JobRepository.TERMINAL_STATUSES.includes(status);
    const query = this.database(this.tableName).where({ object_id: id, owner });
    if (!isTerminal) {
      query.whereNotIn('status', JobRepository.TERMINAL_STATUSES);
    }
    const update: Record<string, unknown> = {
      status,
      job_reason_failure: description,
      last_edited_time: new Date(),
    };
    if (cardCount != null && cardCount >= 0) {
      update.card_count = cardCount;
    }
    const rows = await query.update(update).returning('*');
    return rows[0] as Jobs;
  }
  countJobsByType(owner: string, type: string): Promise<number> {
    return this.database(this.tableName)
      .where({ owner, type })
      .count('* as count')
      .first()
      .then((row) => Number((row as { count: string | number })?.count ?? 0));
  }

  countJobsByOwner(owner: string): Promise<number> {
    return this.database(this.tableName)
      .where({ owner })
      .count('* as count')
      .first()
      .then((row) => Number((row as { count: string | number })?.count ?? 0));
  }

  deleteOldJobs(type: string, olderThanMs: number): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanMs);
    return this.database(this.tableName)
      .where({ type })
      .whereIn('status', JobRepository.TERMINAL_STATUSES)
      .where('last_edited_time', '<', cutoff)
      .delete();
  }
}

export default JobRepository;
