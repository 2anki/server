import { existsSync } from 'fs';
import path from 'path';
import http from 'http';

import express, { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import morgan from 'morgan';

const localEnvFile = path.join(__dirname, '../.env');
if (existsSync(localEnvFile)) {
  dotenv.config({ path: localEnvFile });
}

import { BUILD_DIR } from './lib/constants';
import ErrorHandler from './routes/middleware/ErrorHandler';

// Server Endpoints
import settingsRouter from './routes/SettingsRouter';
import checksRouter from './routes/ChecksRouter';
import versionRouter from './routes/VersionRouter';
import uploadRouter from './routes/UploadRouter';
import usersRouter from './routes/UserRouter';
import notionRouter from './routes/NotionRouter';
import rulesRouter from './routes/ParserRulesRouter';
import downloadRouter from './routes/DownloadRouter';
import apkgRouter from './routes/ApkgRouter';
import favoriteRouter from './routes/FavoriteRouter';
import ankifyRouter from './routes/AnkifyRouter';
import templatesRouter from './routes/TemplatesRouter';
import defaultRouter from './routes/DefaultRouter';
import webhookRouter from './routes/WebhookRouter';
import swaggerRouter from './routes/SwaggerRouter';

import { getDatabase, setupDatabase } from './data_layer';
import JobRepository from './data_layer/JobRepository';
import { updateStripeSubscriptions } from './lib/storage/jobs/helpers/updateStripeSubscriptions';

function registerSignalHandlers(server: http.Server) {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
  process.on('SIGTERM', () => {
    console.debug('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.debug('HTTP server closed');
    });
  });
  process.on('SIGINT', () => {
    server.close(() => {
      console.debug('HTTP server closed');
    });
  });
}

const serve = async () => {
  const templateDir = path.join(__dirname, 'templates');
  const app = express();

  app.use(webhookRouter());
  app.use(express.json({ limit: '1000mb' }) as RequestHandler);
  app.use(cookieParser());

  app.use(morgan('combined') as RequestHandler);

  app.use('/templates', express.static(templateDir));
  app.use(express.static(BUILD_DIR));

  // API Documentation
  app.use(swaggerRouter());

  app.use(checksRouter());
  app.use(versionRouter());
  app.use(uploadRouter());
  app.use(usersRouter());
  app.use(notionRouter());
  app.use(rulesRouter());
  app.use(settingsRouter());
  app.use(downloadRouter());
  app.use(apkgRouter());
  app.use(favoriteRouter());
  app.use(ankifyRouter());
  app.use(templatesRouter());

  // Note: this has to be the last router
  app.use(defaultRouter());

  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: () => void
    ) => {
      if (!err) {
        next();
      } else {
        ErrorHandler(res, req, err);
      }
    }
  );

  const cwd = process.cwd();
  process.chdir(cwd);
  process.env.SECRET ||= 'victory';
  const port = process.env.PORT || 2020;
  const server = app.listen(port, () => {
    console.info(`🟢 Running on http://localhost:${port}`);
  });
  registerSignalHandlers(server);

  const database = getDatabase();
  await setupDatabase(database);
  const interruptedCount = await new JobRepository(database).markInterruptedClaudeJobs();
  if (interruptedCount > 0) {
    console.info(`[startup] Marked ${interruptedCount} Claude job(s) as interrupted`);
  }

  if (process.env.STRIPE_SYNC_ON_STARTUP === 'true') {
    console.info('[startup] Running Stripe subscription sync in background');
    updateStripeSubscriptions().catch((error) => {
      console.error('[startup] Stripe subscription sync failed:', error);
    });
  }
};

serve();
