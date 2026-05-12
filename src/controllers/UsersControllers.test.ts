import express from 'express';

jest.mock('../lib/integrations/stripe', () => ({
  getStripe: jest.fn().mockReturnValue({
    customers: { retrieve: jest.fn() },
    subscriptions: { retrieve: jest.fn(), cancel: jest.fn(), update: jest.fn() },
  }),
  updateStoreSubscription: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/SubscriptionService', () => ({
  __esModule: true,
  default: {
    cancelUserSubscriptions: jest.fn(),
    findRecentStripeSubscriptions: jest.fn(),
  },
}));

import UsersController from './UsersControllers';
import UsersService from '../services/UsersService';
import AuthenticationService from '../services/AuthenticationService';

const SAMPLE_PW = '12345678';

const buildRes = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { json, status } as unknown as express.Response & {
    json: jest.Mock;
    status: jest.Mock;
  };
};

const buildController = (overrides?: {
  getUserFrom?: jest.Mock;
  register?: jest.Mock;
  getHashPassword?: jest.Mock;
}) => {
  const userService = {
    getUserFrom: overrides?.getUserFrom ?? jest.fn().mockResolvedValue(null),
    register: overrides?.register ?? jest.fn().mockResolvedValue([{ id: 1 }]),
  } as unknown as UsersService;
  const authService = {
    getHashPassword:
      overrides?.getHashPassword ?? jest.fn().mockReturnValue('hashed'),
  } as unknown as AuthenticationService;
  const controller = new UsersController(
    userService,
    authService,
    {} as ReturnType<typeof import('../data_layer').getDatabase>
  );
  return { controller, userService, authService };
};

describe('UsersController.register', () => {
  it('rejects requests missing both email and password with 400', async () => {
    const { controller } = buildController();
    const req = { body: {} } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/email and password/i),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects requests missing only the password with 400', async () => {
    const { controller } = buildController();
    const req = { body: { email: 'a@b.com' } } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('does not require name in the request body', async () => {
    const register = jest.fn().mockResolvedValue([{ id: 1 }]);
    const { controller } = buildController({ register });
    const req = {
      body: { email: 'jane.doe@example.com', password: SAMPLE_PW },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(register).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'ok' });
    expect(next).not.toHaveBeenCalled();
  });

  it('still accepts a name when older clients send one', async () => {
    const register = jest.fn().mockResolvedValue([{ id: 1 }]);
    const { controller } = buildController({ register });
    const req = {
      body: {
        email: 'alex@example.com',
        password: SAMPLE_PW,
        name: 'Alex',
      },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(register).toHaveBeenCalledWith(
      'Alex',
      'hashed',
      'alex@example.com',
      expect.any(String),
      null
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('persists signup_origin when source matches an allowed landing path', async () => {
    const register = jest.fn().mockResolvedValue([{ id: 1 }]);
    const { controller } = buildController({ register });
    const req = {
      body: {
        email: 'al@example.com',
        password: SAMPLE_PW,
        source: '/notion-to-anki',
      },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(register).toHaveBeenCalledWith(
      expect.any(String),
      'hashed',
      'al@example.com',
      expect.any(String),
      '/notion-to-anki'
    );
  });

  it('drops the signup_origin to null when source fails the allowlist regex', async () => {
    const register = jest.fn().mockResolvedValue([{ id: 1 }]);
    const { controller } = buildController({ register });
    const req = {
      body: {
        email: 'al@example.com',
        password: SAMPLE_PW,
        source: '<script>alert(1)</script>',
      },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(register).toHaveBeenCalledWith(
      expect.any(String),
      'hashed',
      'al@example.com',
      expect.any(String),
      null
    );
  });

  it('returns 400 when the email is already registered', async () => {
    const getUserFrom = jest
      .fn()
      .mockResolvedValue({ id: 1, email: 'taken@example.com' });
    const register = jest.fn();
    const { controller } = buildController({ getUserFrom, register });
    const req = {
      body: { email: 'taken@example.com', password: SAMPLE_PW },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(register).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'An account with this email already exists. Try logging in instead.',
    });
  });
});
