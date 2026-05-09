import express from 'express';

import { makeRequireAnkifyAccess } from './RequireAnkifyAccess';
import AuthenticationService from '../../services/AuthenticationService';

const makeRequest = (token: string | undefined): express.Request =>
  ({
    cookies: token == null ? {} : { token },
  } as unknown as express.Request);

interface FakeResponse {
  statusCode: number;
  body: unknown;
  locals: Record<string, unknown>;
  status: jest.Mock;
  json: jest.Mock;
}

const makeResponse = (): FakeResponse => {
  const state: FakeResponse = {
    statusCode: 200,
    body: undefined,
    locals: {},
  } as FakeResponse;

  state.status = jest.fn((code: number) => {
    state.statusCode = code;
    return state;
  });

  state.json = jest.fn((body: unknown) => {
    state.body = body;
    return state;
  });

  return state;
};

const makeAuthService = (
  user: { id: number; email: string; patreon: boolean | null } | null
): AuthenticationService =>
  ({
    getUserFrom: jest.fn(async () =>
      user == null ? null : { ...user, owner: user.id }
    ),
  } as unknown as AuthenticationService);

describe('RequireAnkifyAccess', () => {
  test('401s when no authenticated user', async () => {
    const middleware = makeRequireAnkifyAccess(makeAuthService(null));
    const res = makeResponse();
    const next = jest.fn();

    await middleware(
      makeRequest(undefined),
      res as unknown as express.Response,
      next
    );

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('403s when authenticated user does not have patreon access', async () => {
    const middleware = makeRequireAnkifyAccess(
      makeAuthService({
        id: 7,
        email: 'someone-else@example.com',
        patreon: false,
      })
    );
    const res = makeResponse();
    const next = jest.fn();

    await middleware(
      makeRequest('cookie-token'),
      res as unknown as express.Response,
      next
    );

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('403s when patreon is null', async () => {
    const middleware = makeRequireAnkifyAccess(
      makeAuthService({
        id: 7,
        email: 'someone-else@example.com',
        patreon: null,
      })
    );
    const res = makeResponse();
    const next = jest.fn();

    await middleware(
      makeRequest('cookie-token'),
      res as unknown as express.Response,
      next
    );

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next and sets owner local when user has patreon access', async () => {
    const middleware = makeRequireAnkifyAccess(
      makeAuthService({
        id: 42,
        email: 'patron@example.com',
        patreon: true,
      })
    );
    const res = makeResponse();
    const next = jest.fn();

    await middleware(
      makeRequest('cookie-token'),
      res as unknown as express.Response,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.owner).toBe(42);
  });
});
