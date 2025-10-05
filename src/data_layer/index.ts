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
  connection: process.env.DATABASE_URL,
});

export const getDatabase = () => SINGLE_CONNECTION;

export const setupDatabase = async (database: Knex) => {
  if (!process.env.DATABASE_URL) {
    console.info('DATABASE_URL is not set, skipping DB setup.');
    console.warn(
      "Things might not work as expected. If you're running this locally, you can ignore this warning if you are only interested in HTML uploads."
    );
    return;
  }

  try {
    await database.raw('SELECT 1');
    if (process.env.MIGRATIONS_DIR) {
      process.chdir(path.join(process.env.MIGRATIONS_DIR, '..'));
    }

    if (process.env.NODE_ENV === 'production') {
      console.info('DB is ready');

      // Only run cleanup jobs on main instance to avoid conflicts with Singapore instance
      if (process.env.INSTANCE_ID === 'singapore') {
        console.info(
          'Singapore instance: Cleanup jobs disabled to prevent conflicts'
        );
      } else {
        console.info('Main instance: Starting cleanup jobs');
        ScheduleCleanup(database);
      }
    }

    await database.migrate.latest(KnexConfig as MigratorConfig);

    // Completed jobs become uploads. Any left during startup means they failed.
    await database.raw("UPDATE jobs SET status = 'failed';");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
