import { Knex } from 'knex';

import performConversion from '../../routes/notion/convert/helpers/performConversion';
import TokenHandler from '../misc/TokenHandler';
import NotionAPIWrapper from '../notion/NotionAPIWrapper';

export default class ConversionJob {
  db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async isActiveJob(object_id: string, owner: string) {
    const jobMatch = await this.db('jobs')
      .where({ object_id, owner })
      .returning(['id', 'owner', 'status'])
      .first();
    return jobMatch && jobMatch.status === 'started';
  }

  async AllStartedJobs(owner: string) {
    return this.db('jobs')
      .where({ owner, status: 'started' })
      .returning(['object_id', 'status', 'size_mb']);
  }

  started(object_id: string, owner: string) {
    return this.db('jobs')
      .insert({
        object_id,
        owner,
        status: 'started',
        last_edited_time: new Date(),
      })
      .onConflict('object_id')
      .merge();
  }

  completed(object_id: string, owner: string) {
    return this.db('jobs').del().where({ object_id, owner });
  }

  static async MarkStartedJobsStale(db: Knex) {
    const allStartedJobs = await db('jobs')
      .where({ status: 'started' })
      .returning('id');
    for (const job of allStartedJobs) {
      console.debug(`Marking job stale ${job.id}`);
      await db('jobs').update({ status: 'stale' }).where({ id: job.id });
    }
  }

  static GetStaleJobs(DB: Knex, owner: string) {
    return DB('jobs').where({ status: 'stale', owner });
  }

  static ResumeStaleJobs(DB: Knex, owner: string) {
    return ConversionJob.GetStaleJobs(DB, owner).then((jobs) => {
      console.log('jobs', jobs);
      jobs.forEach(async (job) => {
        try {
          const token = await TokenHandler.GetNotionToken(job.owner);
          const api = new NotionAPIWrapper(token!);
          await performConversion(api, job.object_id, job.owner, null, null);
        } catch (error) {
          await new ConversionJob(DB).completed(job.object_id, job.owner);
        }
      });
    });
  }
}
