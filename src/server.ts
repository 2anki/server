import { existsSync } from 'fs';
import path from 'path';

import morgan from 'morgan';
import express, { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { ALLOWED_ORIGINS, BUILD_DIR, INDEX_FILE } from './lib/constants';
import ErrorHandler from './lib/misc/ErrorHandler';

// Server Endpoints
import _settings from './routes/settings';
import checks from './routes/checks';
import version from './routes/version';
import upload from './routes/upload';
import users from './routes/users';
import notion from './routes/notion';
import rules from './routes/rules';
import download from './routes/download/u';
import favorite from './routes/favorite';
import templates from './routes/templates';

import DB from './lib/storage/db';
import KnexConfig from './KnexConfig';
import TokenHandler from './lib/misc/TokenHandler';
import CrashReporter from './lib/CrashReporter';
import { ScheduleCleanup } from './lib/storage/jobs/JobHandler';
import RequireAuthentication from './middleware/RequireAuthentication';
import { Knex } from 'knex';
import { sendError } from './lib/error/sendError';

const localEnvFile = path.join(__dirname, '/../.env');
if (existsSync(localEnvFile)) {
  dotenv.config({ path: localEnvFile });
}

import MigratorConfig = Knex.MigratorConfig;

async function serve() {
  const templateDir = path.join(__dirname, 'templates');
  const app = express();

  app.use(express.json({ limit: '1000mb' }) as RequestHandler);
  app.use(cookieParser());
  if (process.env.NODE_ENV === 'production') {
    CrashReporter.Configure(app);
  }

  if (process.env.SPACES_DEFAULT_BUCKET_NAME !== 'dev.2anki.net') {
    app.use(morgan('combined') as RequestHandler);
  }

  app.use('/templates', express.static(templateDir));
  app.use(express.static(BUILD_DIR));
  app.use('/checks', checks);
  app.use('/version', version);

  app.get('/search*', RequireAuthentication, async (_req, res) => {
    res.sendFile(INDEX_FILE);
  });

  app.get('/login', async (req, res) => {
    const user = await TokenHandler.GetUserFrom(req.cookies.token);
    if (!user) {
      res.sendFile(INDEX_FILE);
    } else {
      res.redirect('/search');
    }
  });
  app.get('/api/uploads*', RequireAuthentication, upload);

  app.use('/api/upload', upload);
  app.use('/api/users', users);
  app.use('/api/notion', notion);
  app.use('/api/rules', rules);
  app.use('/api/settings', _settings);
  app.use('/api/download', download);
  app.use('/api/favorite', favorite);
  app.use('/api/templates', templates);
  app.get('/patr*on', (req, res) =>
    res.redirect('https://www.patreon.com/alemayhu')
  );

  // Note: this has to be the last handler
  app.get('*', (_req, res) => {
    res.sendFile(INDEX_FILE);
  });

  app.use(
    (
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.header('Access-Control-Allow-Origin', ALLOWED_ORIGINS.join(','));
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Content-Disposition'
      );
      res.header('Access-Control-Request-Headers', '*');
      next();
    }
  );

  if (process.env.NODE_ENV === 'production') {
    CrashReporter.AddErrorHandler(app);
  }

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      next: () => void
    ) => {
      if (!err) {
        next();
      } else {
        ErrorHandler(res, err);
      }
    }
  );

  process.on('uncaughtException', sendError);
  console.info('DB is ready');
  DB.raw('SELECT 1').then(() => {});
  const cwd = process.cwd();
  if (process.env.MIGRATIONS_DIR) {
    process.chdir(path.join(process.env.MIGRATIONS_DIR, '..'));
  }
  ScheduleCleanup(DB);
  DB.migrate.latest(KnexConfig as MigratorConfig).then(async () => {
    // Completed jobs become uploads. Any left during startup means they failed.
    await DB.raw("UPDATE jobs SET status = 'failed';");
    process.chdir(cwd);
    process.env.SECRET ||= 'victory';
    const port = process.env.PORT || 2020;
    const server = app.listen(port, () => {
      console.info(`🟢 Running on http://localhost:${port}`);
    });

    process.on('SIGTERM', () => {
      console.debug('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        console.debug('HTTP server closed');
      });
    });
    process.on('SIGINT', async () => {
      server.close(async () => {
        console.debug('HTTP server closed');
      });
    });
  });
}

serve();
