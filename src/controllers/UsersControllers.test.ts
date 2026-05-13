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
import UsersService, { MagicLinkRateLimitError } from '../services/UsersService';
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

describe('UsersController.requestMagicLink', () => {
  const buildMagicController = (overrides?: {
    requestMagicLink?: jest.Mock;
  }) => {
    const userService = {
      requestMagicLink:
        overrides?.requestMagicLink ?? jest.fn().mockResolvedValue(undefined),
    } as unknown as UsersService;
    const authService = {} as AuthenticationService;
    const controller = new UsersController(
      userService,
      authService,
      {} as ReturnType<typeof import('../data_layer').getDatabase>
    );
    return { controller, userService };
  };

  it('returns 200 for a valid email and purpose', async () => {
    const { controller } = buildMagicController();
    const req = {
      body: { email: 'al@example.com', purpose: 'login' },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.requestMagicLink(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'ok' });
  });

  it('defaults purpose to login when not provided', async () => {
    const requestMagicLink = jest.fn().mockResolvedValue(undefined);
    const { controller } = buildMagicController({ requestMagicLink });
    const req = {
      body: { email: 'al@example.com' },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.requestMagicLink(req, res, next);

    expect(requestMagicLink).toHaveBeenCalledWith('al@example.com', 'login');
  });

  it('returns 400 when email is missing', async () => {
    const { controller } = buildMagicController();
    const req = { body: { purpose: 'login' } } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.requestMagicLink(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for an invalid purpose', async () => {
    const { controller } = buildMagicController();
    const req = {
      body: { email: 'al@example.com', purpose: 'evil' },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.requestMagicLink(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid purpose' });
  });

  it('returns 200 even when rate limited to prevent email enumeration', async () => {
    const requestMagicLink = jest
      .fn()
      .mockRejectedValue(new MagicLinkRateLimitError());
    const { controller } = buildMagicController({ requestMagicLink });
    const req = {
      body: { email: 'al@example.com', purpose: 'login' },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.requestMagicLink(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 even when the service throws a non-rate-limit error', async () => {
    const requestMagicLink = jest
      .fn()
      .mockRejectedValue(new Error('SendGrid down'));
    const { controller } = buildMagicController({ requestMagicLink });
    const req = {
      body: { email: 'al@example.com', purpose: 'login' },
    } as express.Request;
    const res = buildRes();
    const next = jest.fn();

    await controller.requestMagicLink(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'ok' });
  });
});

describe('UsersController.verifyMagicLink', () => {
  const buildVerifyController = (overrides?: {
    verifyMagicToken?: jest.Mock;
    getUserById?: jest.Mock;
    newJWTToken?: jest.Mock;
    persistToken?: jest.Mock;
    updateLastLoginAt?: jest.Mock;
  }) => {
    const userService = {
      verifyMagicToken:
        overrides?.verifyMagicToken ?? jest.fn().mockResolvedValue(null),
      getUserById:
        overrides?.getUserById ??
        jest.fn().mockResolvedValue({ id: 1, email: 'al@example.com' }),
      updateLastLoginAt:
        overrides?.updateLastLoginAt ?? jest.fn().mockResolvedValue(undefined),
    } as unknown as UsersService;
    const authService = {
      newJWTToken:
        overrides?.newJWTToken ??
        jest.fn().mockResolvedValue('jwt-token-abc'),
      persistToken:
        overrides?.persistToken ?? jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthenticationService;
    const controller = new UsersController(
      userService,
      authService,
      {} as ReturnType<typeof import('../data_layer').getDatabase>
    );
    return { controller, userService, authService };
  };

  const buildVerifyRes = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const cookie = jest.fn();
    return { json, status, cookie } as unknown as express.Response & {
      json: jest.Mock;
      status: jest.Mock;
      cookie: jest.Mock;
    };
  };

  it('returns 400 for an invalid token', async () => {
    const { controller } = buildVerifyController();
    const req = { params: { token: 'bad-token' } } as unknown as express.Request;
    const res = buildVerifyRes();
    const next = jest.fn();

    await controller.verifyMagicLink(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'This link is invalid or has expired.',
    });
  });

  it('sets a JWT cookie and returns the token for a login purpose', async () => {
    const verifyMagicToken = jest
      .fn()
      .mockResolvedValue({ userId: 5, purpose: 'login' });
    const newJWTToken = jest.fn().mockResolvedValue('jwt-login-tok');
    const persistToken = jest.fn().mockResolvedValue(undefined);
    const updateLastLoginAt = jest.fn().mockResolvedValue(undefined);
    const getUserById = jest
      .fn()
      .mockResolvedValue({ id: 5, email: 'al@example.com' });
    const { controller } = buildVerifyController({
      verifyMagicToken,
      newJWTToken,
      persistToken,
      updateLastLoginAt,
      getUserById,
    });
    const req = { params: { token: 'valid-tok' } } as unknown as express.Request;
    const res = buildVerifyRes();
    const next = jest.fn();

    await controller.verifyMagicLink(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith('token', 'jwt-login-tok');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'jwt-login-tok' });
    expect(persistToken).toHaveBeenCalledWith('jwt-login-tok', '5');
    expect(updateLastLoginAt).toHaveBeenCalledWith('5');
  });

  it('returns purpose and userId for a password_reset token', async () => {
    const verifyMagicToken = jest
      .fn()
      .mockResolvedValue({ userId: 8, purpose: 'password_reset' });
    const { controller } = buildVerifyController({ verifyMagicToken });
    const req = { params: { token: 'reset-tok' } } as unknown as express.Request;
    const res = buildVerifyRes();
    const next = jest.fn();

    await controller.verifyMagicLink(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      purpose: 'password_reset',
      userId: 8,
    });
  });
});
