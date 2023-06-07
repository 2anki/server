import process from 'process';
import path from 'path';

import knex, { Knex } from 'knex';
import MigratorConfig = Knex.MigratorConfig;

import { ScheduleCleanup } from '../lib/storage/jobs/ScheduleCleanup';
import KnexConfig from '../KnexConfig';

/**
 * Performing this assignment here to prevent new connections from being created.
 */
const SINGLE_CONNECTION = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://localhost:5432/n',
});

export const getDatabase = () => SINGLE_CONNECTION;

export const setupDatabase = async (database: Knex) => {
  try {
    await database.raw('SELECT 1');
    if (process.env.MIGRATIONS_DIR) {
      process.chdir(path.join(process.env.MIGRATIONS_DIR, '..'));
    }
    console.info('DB is ready');
    ScheduleCleanup(database);

    await database.migrate.latest(KnexConfig as MigratorConfig);

    // Completed jobs become uploads. Any left during startup means they failed.
    await database.raw("UPDATE jobs SET status = 'failed';");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
