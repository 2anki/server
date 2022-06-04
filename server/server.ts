import ConversionJob from './lib/jobs/ConversionJob';
import DB from './lib/storage/db';
import { existsSync } from 'fs';
import { getApi } from './getApi';
import path from 'path';
import { ScheduleCleanup } from './lib/jobs/JobHandler';
import { IsDebug } from './lib/debug';
import KnexConfig from './KnexConfig';
import * as dotenv from 'dotenv';

if (IsDebug()) {
  const localEnvFile = path.join(__dirname, '.env');
  if (existsSync(localEnvFile)) {
    dotenv.config({ path: localEnvFile });
  }
}

(async function (): Promise<void> {
  try {
    const templateDir = path.join(__dirname, 'templates');
    const api = getApi(templateDir);

    await DB.raw('SELECT 1');
    console.info('DB is ready');

    const cwd = process.cwd();
    if (process.env.MIGRATIONS_DIR) {
      process.chdir(path.join(process.env.MIGRATIONS_DIR, '..'));
    }
    ScheduleCleanup(DB);
    /* @ts-ignore */
    await DB.migrate.latest(KnexConfig);

    process.chdir(cwd);
    process.env.SECRET ||= 'victory';
    const port = process.env.PORT || 2020;

    const server = api.listen(port, () => {
      console.info(`🟢 Running on http://localhost:${port}`);
    });

    const HandleStartedJobs = async () => {
      await ConversionJob.MarkStartedJobsStale(DB);
    };

    process.on('SIGTERM', () => {
      console.debug('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        console.debug('HTTP server closed');
        await HandleStartedJobs();
      });
    });

    process.on('SIGINT', async () => {
      server.close(async () => {
        console.debug('HTTP server closed');
        await HandleStartedJobs();
      });
    });
  } catch (ex: unknown) {
    console.error(ex);
    process.exit(1);
  }
})();
