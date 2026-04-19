import express from 'express';

import ErrorHandler from './ErrorHandler';

const makeRequest = (): express.Request =>
  ({
    body: {},
    path: '/api/sample',
    method: 'POST',
    query: {},
    files: [],
  } as unknown as express.Request);

interface FakeResponse {
  headersSent: boolean;
  statusCode: number;
  headers: Record<string, string>;
  body: string | undefined;
  set: jest.Mock;
  status: jest.Mock;
  send: jest.Mock;
}

const makeResponse = (headersSent: boolean): FakeResponse => {
  const state: FakeResponse = {
    headersSent,
    statusCode: 200,
    headers: {},
    body: undefined,
  } as FakeResponse;

  state.set = jest.fn((name: string, value: string) => {
    if (state.headersSent) {
      throw Object.assign(
        new Error('Cannot set headers after they are sent to the client'),
        { code: 'ERR_HTTP_HEADERS_SENT' }
      );
    }
    state.headers[name] = value;
    return state;
  });

  state.status = jest.fn((code: number) => {
    if (state.headersSent) {
      throw Object.assign(
        new Error('Cannot set headers after they are sent to the client'),
        { code: 'ERR_HTTP_HEADERS_SENT' }
      );
    }
    state.statusCode = code;
    return state;
  });

  state.send = jest.fn((body: string) => {
    state.body = body;
    state.headersSent = true;
    return state;
  });

  return state;
};

describe('ErrorHandler', () => {
  test('writes 400 response with error message when headers not yet sent', async () => {
    const res = makeResponse(false);
    const req = makeRequest();

    await ErrorHandler(
      res as unknown as express.Response,
      req,
      new Error('something failed')
    );

    expect(res.headers['Content-Type']).toBe('text/plain');
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('something failed');
  });

  test('does not throw when headers have already been sent', async () => {
    const res = makeResponse(true);
    const req = makeRequest();

    await expect(
      ErrorHandler(
        res as unknown as express.Response,
        req,
        new Error('late failure')
      )
    ).resolves.toBeUndefined();

    expect(res.set).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});
