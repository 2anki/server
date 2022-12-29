import { Knex } from 'knex';
import { Job } from '../../types';

export const getAllMyJobs = async (
  db: Knex,
  owner: string
): Promise<Array<Job>> => {
  return db('jobs')
    .where({ owner })
    .andWhereNot({ status: 'completed' })
    .returning(['*']);
};
