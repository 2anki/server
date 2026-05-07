import process from 'process';
import path from 'path';

import knex, { Knex } from 'knex';
import MigratorConfig = Knex.MigratorConfig;

import { ScheduleCleanup } from '../lib/storage/jobs/ScheduleCleanup';
import { scheduleAnkifyReaper } from '../lib/ankify/jobs/scheduleAnkifyReaper';
import { RacService } from '../services/ankify/RacService';
import { AnkifyClientsRepository } from './ankify/AnkifyClientsRepository';
import { AnkifyExportSchedulesRepository } from './ankify/AnkifyExportSchedulesRepository';
import { AnkifyExportScheduler } from '../services/ankify/AnkifyExportScheduler';
import { ExportReviewDataToNotionUseCase } from '../usecases/ankify/ExportReviewDataToNotionUseCase';
import {
  AnkiConnectClient,
  buildAnkiConnectUrl,
} from '../services/ankify/AnkiConnectClient';
import NotionRepository from './NotionRespository';
import { Client as NotionClient } from '@notionhq/client';
import { setAnkifyExportScheduler } from '../lib/ankify/scheduler/instance';
import Docker from 'dockerode';
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

    if (process.env.NODE_ENV === 'production' && !process.env.LOCAL_DEV) {
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

    if (process.env.INSTANCE_ID !== 'singapore') {
      const ankifyRepo = new AnkifyClientsRepository(database);
      const ankifyRac = new RacService(ankifyRepo, new Docker());
      scheduleAnkifyReaper(ankifyRac);

      const schedulesRepo = new AnkifyExportSchedulesRepository(database);
      const notionRepo = new NotionRepository(database);
      const exportUseCase = new ExportReviewDataToNotionUseCase(
        ankifyRepo,
        notionRepo,
        (host, port) =>
          new AnkiConnectClient(buildAnkiConnectUrl(host, port)),
        (token) => {
          const notion = new NotionClient({ auth: token });
          return {
            databases: {
              query: async (params) => {
                const db = await notion.databases.retrieve({
                  database_id: params.database_id,
                });
                const dataSources =
                  'data_sources' in db
                    ? (db as { data_sources: { id: string }[] }).data_sources
                    : [];
                const aggregated: { results: unknown[] } = { results: [] };
                for (const ds of dataSources) {
                  const res = await notion.dataSources.query({
                    data_source_id: ds.id,
                    filter: params.filter as never,
                  });
                  aggregated.results.push(...res.results);
                }
                return aggregated;
              },
            },
            pages: {
              create: (params) =>
                notion.pages.create(
                  params as Parameters<typeof notion.pages.create>[0]
                ),
            },
          };
        }
      );
      const scheduler = new AnkifyExportScheduler(
        schedulesRepo,
        exportUseCase
      );
      setAnkifyExportScheduler(scheduler);
      const recovered = await scheduler.recoverAll();
      console.info(
        `Ankify scheduler recovered ${recovered} schedule(s)`
      );
    }

    // Completed jobs become uploads. Any left during startup means they failed.
    // Claude jobs are handled separately by markInterruptedClaudeJobs to preserve restart capability.
    await database.raw("UPDATE jobs SET status = 'failed' WHERE status NOT IN ('done', 'failed', 'cancelled', 'interrupted') AND type IS DISTINCT FROM 'claude';");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
