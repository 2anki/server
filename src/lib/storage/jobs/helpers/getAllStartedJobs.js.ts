import { Knex } from 'knex';
import { Job } from '../../types';

export const getAllStartedJobs = async (
  db: Knex,
  owner: string
): Promise<Array<Job>> => {
  return db('jobs')
    .where({ owner, status: 'started' })
    .returning(['object_id', 'status', 'size_mb']);
};
