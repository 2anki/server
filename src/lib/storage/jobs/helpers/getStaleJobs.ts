import { Knex } from 'knex';

export const getStaleJobs = (db: Knex, owner: string) => {
  return db('jobs').where({ status: 'stale', owner });
};
