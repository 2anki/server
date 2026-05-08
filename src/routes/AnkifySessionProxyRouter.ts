import express from 'express';
import type { IncomingMessage, Server as HttpServer } from 'node:http';
import type { Socket } from 'node:net';
import { createProxyMiddleware } from 'http-proxy-middleware';

import AuthenticationService from '../services/AuthenticationService';
import TokenRepository from '../data_layer/TokenRepository';
import UsersRepository from '../data_layer/UsersRepository';
import { AnkifyClientsRepository } from '../data_layer/ankify/AnkifyClientsRepository';
import { AnkifySessionTokensRepository } from '../data_layer/ankify/AnkifySessionTokensRepository';
import { RacService } from '../services/ankify/RacService';
import { ValidateAnkifySessionTokenUseCase } from '../usecases/ankify/ValidateAnkifySessionTokenUseCase';
import { getDatabase } from '../data_layer';
import Docker from 'dockerode';

const TOKEN_PATTERN = /^\/v\/([A-Za-z0-9_-]{43})/;
const PORT_KEY = '__ankifyNovncPort';

interface RequestWithPort extends express.Request {
  [PORT_KEY]?: number;
}

const parseCookieToken = (
  cookieHeader: string | undefined
): string | undefined => {
  if (cookieHeader == null) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [rawKey, rawValue] = part.trim().split('=');
    if (rawKey === 'token' && rawValue != null && rawValue.length > 0) {
      return decodeURIComponent(rawValue);
    }
  }
  return undefined;
};

export const attachAnkifySessionProxy = (
  app: express.Express,
  httpServer: HttpServer,
  validate: ValidateAnkifySessionTokenUseCase
) => {
  const proxy = createProxyMiddleware<express.Request, express.Response>({
    router: (req) => {
      const port = (req as RequestWithPort)[PORT_KEY];
      if (port == null) {
        return 'http://127.0.0.1:0';
      }
      return `http://127.0.0.1:${port}`;
    },
    changeOrigin: true,
    logger: console,
  });

  const authMiddleware: express.RequestHandler = async (req, res, next) => {
    const token = req.params.token;
    const cookieToken =
      typeof req.cookies?.token === 'string' ? req.cookies.token : undefined;
    const result = await validate.execute({
      sessionToken: token,
      cookieToken,
    });
    if (!result.ok) {
      res.status(result.status).json({ message: result.reason });
      return;
    }
    (req as RequestWithPort)[PORT_KEY] = result.novnc_port;
    next();
  };

  app.use('/v/:token', authMiddleware, proxy as express.RequestHandler);

  httpServer.on(
    'upgrade',
    async (req: IncomingMessage, socket: Socket, head: Buffer) => {
      if (req.url == null) {
        return;
      }
      const match = TOKEN_PATTERN.exec(req.url);
      if (match == null) {
        return;
      }
      const token = match[1];
      const cookieToken = parseCookieToken(req.headers.cookie);
      const result = await validate.execute({
        sessionToken: token,
        cookieToken,
      });
      if (!result.ok) {
        socket.destroy();
        return;
      }
      (req as IncomingMessage & { [PORT_KEY]?: number })[PORT_KEY] =
        result.novnc_port;
      const upgradeHandler = (
        proxy as unknown as {
          upgrade?: (
            req: IncomingMessage,
            socket: Socket,
            head: Buffer
          ) => void;
        }
      ).upgrade;
      if (upgradeHandler == null) {
        socket.destroy();
        return;
      }
      upgradeHandler(req, socket, head);
    }
  );
};

export const buildAnkifySessionProxyDeps = () => {
  const db = getDatabase();
  const docker = new Docker();
  const clientsRepo = new AnkifyClientsRepository(db);
  const sessionTokensRepo = new AnkifySessionTokensRepository(db);
  const rac = new RacService(clientsRepo, docker, sessionTokensRepo);
  const authService = new AuthenticationService(
    new TokenRepository(db),
    new UsersRepository(db)
  );
  return new ValidateAnkifySessionTokenUseCase(rac, authService);
};
