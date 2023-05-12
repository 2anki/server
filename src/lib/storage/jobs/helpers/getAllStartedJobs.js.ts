import { Knex } from 'knex';
import { Job } from '../../types';

export const getAllMyJobs = (db: Knex, owner: string): Promise<Array<Job>> =>
  db('jobs').where({ owner }).returning(['*']);
