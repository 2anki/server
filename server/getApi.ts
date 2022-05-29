import cookieParser from 'cookie-parser';
import CrashReporter from './lib/CrashReporter';
import ErrorHandler from './lib/misc/ErrorHandler';
import morgan from 'morgan';
import RequireAuthentication from './middleware/RequireAuthentication';
import express, { Express } from 'express';
import { ALLOWED_ORIGINS, BUILD_DIR, INDEX_FILE } from './lib/constants';

import _settings from './routes/settings';
import checks from './routes/checks';
import version from './routes/version';
import upload from './routes/upload';
import users from './routes/users';
import notion from './routes/notion';
import rules from './routes/rules';
import download from './routes/download/u';
import favorite from './routes/favorite';
import { login } from './routes/login';
import { search } from './routes/search';

const getApi = function (templateDir: string): Express {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  if (process.env.NODE_ENV === 'production') {
    CrashReporter.Configure(app);
  }

  if (process.env.SPACES_DEFAULT_BUCKET_NAME !== 'dev.2anki.net') {
    app.use(morgan('combined'));
  }

  app.use('/templates', express.static(templateDir));
  app.use(express.static(BUILD_DIR));
  app.use('/checks', checks);
  app.use('/version', version);

  app.get('/search*', RequireAuthentication, search);
  app.get('/login', login);
  app.get('/api/uploads*', RequireAuthentication, upload);

  app.use('/api/upload', upload);
  app.use('/api/users', users);
  app.use('/api/notion', notion);
  app.use('/api/rules', rules);
  app.use('/api/settings', _settings);
  app.use('/api/download', download);
  app.use('/api/favorite', favorite);

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
      next();
    }
  );

  if (process.env.NODE_ENV === 'production') {
    CrashReporter.AddErrorHandler(app);
  }

  app.use((err: Error, _req: express.Request, res: express.Response) =>
    ErrorHandler(res, err)
  );

  return app;
};

export { getApi };
