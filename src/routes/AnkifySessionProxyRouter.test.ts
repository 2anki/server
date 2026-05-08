import express from 'express';
import http from 'node:http';

const capturedOptions: { value: Record<string, unknown> | null } = {
  value: null,
};

jest.mock('http-proxy-middleware', () => {
  const middleware = Object.assign(
    jest.fn((_req: unknown, _res: unknown, next: () => void) => next()),
    { upgrade: jest.fn() }
  );
  return {
    createProxyMiddleware: jest.fn((options: Record<string, unknown>) => {
      capturedOptions.value = options;
      return middleware;
    }),
  };
});

import { attachAnkifySessionProxy } from './AnkifySessionProxyRouter';
import { ValidateAnkifySessionTokenUseCase } from '../usecases/ankify/ValidateAnkifySessionTokenUseCase';

const VALID_TOKEN = 'A'.repeat(43);

const makeFakeValidate = (port: number) =>
  ({
    execute: async () => ({ ok: true as const, novnc_port: port }),
  }) as unknown as ValidateAnkifySessionTokenUseCase;

describe('attachAnkifySessionProxy', () => {
  beforeEach(() => {
    capturedOptions.value = null;
  });

  test('does not pass ws:true to the proxy (would race with our upgrade handler)', () => {
    const app = express();
    const server = http.createServer(app);
    attachAnkifySessionProxy(app, server, makeFakeValidate(54321));

    expect(capturedOptions.value).not.toBeNull();
    expect(capturedOptions.value?.ws).not.toBe(true);
  });

  test('registers exactly one upgrade handler on the http server', () => {
    const app = express();
    const server = http.createServer(app);
    attachAnkifySessionProxy(app, server, makeFakeValidate(54321));

    expect(server.listenerCount('upgrade')).toBe(1);
  });

  test('upgrade handler validates and forwards to proxy.upgrade with port set', async () => {
    const app = express();
    const server = http.createServer(app);
    attachAnkifySessionProxy(app, server, makeFakeValidate(54321));

    const upgradeListeners = server.listeners(
      'upgrade'
    ) as ((req: http.IncomingMessage, socket: unknown, head: Buffer) => Promise<void>)[];
    const ourHandler = upgradeListeners[0];

    const req = {
      url: `/v/${VALID_TOKEN}/websockify`,
      headers: { cookie: 'token=abc' },
    } as unknown as http.IncomingMessage;
    const socket = { destroy: jest.fn() };
    const head = Buffer.alloc(0);

    await ourHandler(req, socket, head);

    expect((req as unknown as { __ankifyNovncPort: number }).__ankifyNovncPort).toBe(
      54321
    );
    expect(socket.destroy).not.toHaveBeenCalled();
  });
});
