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

import { ALLOWED_ORIGINS, BUILD_DIR } from './lib/constants';
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
import favoriteRouter from './routes/FavoriteRouter';
import templatesRouter from './routes/TemplatesRouter';
import defaultRouter from './routes/DefaultRouter';
import webhookRouter from './routes/WebhookRouter';
import swaggerRouter from './routes/SwaggerRouter';

import { getDatabase, setupDatabase } from './data_layer';

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
  app.use(favoriteRouter());
  app.use(templatesRouter());

  // Note: this has to be the last router
  app.use(defaultRouter());

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

  await setupDatabase(getDatabase());
};

serve();
