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
import {
  attachAnkifySessionProxy,
  buildAnkifySessionProxyDeps,
} from './routes/AnkifySessionProxyRouter';
import templatesRouter from './routes/TemplatesRouter';
import defaultRouter from './routes/DefaultRouter';
import rejectScannerProbes from './routes/middleware/rejectScannerProbes';
import webhookRouter from './routes/WebhookRouter';
import ankifyWebhookRouter from './routes/AnkifyWebhookRouter';
import swaggerRouter from './routes/SwaggerRouter';
import opsRouter from './routes/OpsRouter';
import opsDiscoveryRouter from './routes/OpsDiscoveryRouter';
import ostRouter from './routes/OstRouter';
import feedbackRouter from './routes/FeedbackRouter';
import contactMessagesRouter from './routes/ContactMessagesRouter';
import showcaseRouter from './routes/ShowcaseRouter';
import emojiFeedbackRouter from './routes/EmojiFeedbackRouter';
import reEngagementRouter from './routes/ReEngagementRouter';
import imageOcclusionRouter from './routes/ImageOcclusionRouter';
import requestLoggingMiddleware from './routes/middleware/requestLoggingMiddleware';

import { getDatabase, setupDatabase } from './data_layer';
import JobRepository from './data_layer/JobRepository';
import { MagicTokenRepository } from './data_layer/MagicTokenRepository';
import ReEngagementRepository from './data_layer/ReEngagementRepository';
import InactivityEmailRepository from './data_layer/InactivityEmailRepository';
import { updateStripeSubscriptions } from './lib/storage/jobs/helpers/updateStripeSubscriptions';
import { sendReEngagementEmails } from './lib/storage/jobs/helpers/sendReEngagementEmails';
import { scheduleInactivityWarnings } from './lib/inactivity/jobs/scheduleInactivityWarnings';
import { getDefaultEmailService } from './services/EmailService/EmailService';
import { SendInactivityWarningsUseCase } from './usecases/ops/SendInactivityWarningsUseCase';

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
  const server = http.createServer(app);

  app.use(webhookRouter());
  app.use(ankifyWebhookRouter());
  app.use(express.json({ limit: '1000mb' }) as RequestHandler);
  app.use(cookieParser());

  app.use(morgan('combined') as RequestHandler);
  app.use(requestLoggingMiddleware);

  const ankifySessionValidate = buildAnkifySessionProxyDeps();
  // Must run before defaultRouter()'s catch-all (which serves index.html
  // for anything not under /api), otherwise /v/<token>/* gets shadowed
  // by the SPA and users see a 404 instead of their Ankify session.
  attachAnkifySessionProxy(app, server, ankifySessionValidate);

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
  app.use(showcaseRouter());
  app.use(opsRouter());
  app.use(opsDiscoveryRouter());
  app.use(ostRouter());
  app.use(feedbackRouter());
  app.use(contactMessagesRouter());
  app.use(emojiFeedbackRouter());
  app.use(reEngagementRouter());
  app.use(imageOcclusionRouter());

  app.use(rejectScannerProbes);
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
  server.listen(port, () => {
    console.info(`🟢 Running on http://localhost:${port}`);
  });
  registerSignalHandlers(server);

  const database = getDatabase();
  await setupDatabase(database);
  const interruptedCount = await new JobRepository(database).markInterruptedClaudeJobs();
  if (interruptedCount > 0) {
    console.info(`[startup] Marked ${interruptedCount} Claude job(s) as interrupted`);
  }

  new MagicTokenRepository(database).deleteExpired().then((count) => {
    if (count > 0) {
      console.info(`Cleaned up ${count} expired magic token(s)`);
    }
  });

  if (process.env.STRIPE_SYNC_ON_STARTUP === 'true') {
    console.info('[startup] Running Stripe subscription sync in background');
    updateStripeSubscriptions().catch((error) => {
      console.error('[startup] Stripe subscription sync failed:', error);
    });
  }

  const reEngagementRepo = new ReEngagementRepository(database);
  const emailService = getDefaultEmailService();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    sendReEngagementEmails(reEngagementRepo, emailService).catch((error) => {
      console.error('[re-engagement] daily job failed:', error);
    });
  }, ONE_DAY_MS);

  const inactivityEmailRepo = new InactivityEmailRepository(database);
  const sendInactivityWarningsUseCase = new SendInactivityWarningsUseCase(inactivityEmailRepo, emailService);
  scheduleInactivityWarnings(sendInactivityWarningsUseCase);
};

serve();
