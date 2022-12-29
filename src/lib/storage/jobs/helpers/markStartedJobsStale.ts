import { Knex } from 'knex';
import { getAllStartedJobs } from './getAllStartedJobs.js';

export const markStartedJobsStale = async (db: Knex, owner: string) => {
  const allStartedJobs = await getAllStartedJobs(db, owner);
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
