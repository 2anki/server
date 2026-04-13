import express from 'express';

jest.mock('../../data_layer', () => ({
  getDatabase: jest.fn().mockReturnValue({}),
}));

jest.mock('../../services/AuthenticationService');
jest.mock('../../data_layer/TokenRepository');
jest.mock('../../data_layer/UsersRepository');

import AuthenticationService from '../../services/AuthenticationService';
import RequireAuthentication from './RequireAuthentication';

const mockedAuthService =
  AuthenticationService as jest.MockedClass<typeof AuthenticationService>;

function mockRequest(): express.Request {
  return {
    query: {},
    cookies: { token: 'abc' },
  } as unknown as express.Request;
}

function mockResponse() {
  return {
    locals: {},
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as express.Response;
}

describe('RequireAuthentication', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls next when the user is authenticated', async () => {
    mockedAuthService.prototype.getUserFrom = jest
      .fn()
      .mockResolvedValue({ id: 1, owner: 1, email: 'test@test.com' });

    const res = mockResponse();
    const next = jest.fn();
    await RequireAuthentication(mockRequest(), res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('returns 401 when the user is not authenticated', async () => {
    mockedAuthService.prototype.getUserFrom = jest.fn().mockResolvedValue(null);

    const res = mockResponse();
    const next = jest.fn();
    await RequireAuthentication(mockRequest(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
