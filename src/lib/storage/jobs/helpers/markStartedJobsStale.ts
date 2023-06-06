import { Knex } from 'knex';
import JobService from '../../../../services/JobService';
import JobRepository from '../../../../data_layer/JobRepository';

export const markStartedJobsStale = async (db: Knex, owner: string) => {
  const service = new JobService(new JobRepository(db));
  const allStartedJobs = await service.getAllStartedJobs(owner);
  for (const job of allStartedJobs) {
    console.debug(`Marking job stale ${job.id}`);
    await db('jobs')
      .insert({
        object_id: job.id,
        owner,
        status: 'stale',
        last_edited_time: new Date(),
      })
      .onConflict('object_id')
      .merge();
  }
};
