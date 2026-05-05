import express from 'express';

jest.mock('../../../data_layer', () => ({
  getDatabase: jest.fn().mockReturnValue({}),
}));

jest.mock('../../../services/EmailService/EmailService', () => ({
  getDefaultEmailService: jest.fn().mockReturnValue({}),
}));

jest.mock('../../../data_layer/UsersRepository');
jest.mock('../../../services/UsersService');

jest.mock('../../../lib/integrations/stripe', () => ({
  getStripe: jest.fn().mockReturnValue({
    customers: { retrieve: jest.fn() },
  }),
  updateStoreSubscription: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../services/SubscriptionService', () => ({
  __esModule: true,
  default: {
    findActiveStripeSubscriptions: jest.fn(),
  },
}));

import { handleUploadLimitError } from './handleUploadLimitError';
import UsersService from '../../../services/UsersService';
import SubscriptionService from '../../../services/SubscriptionService';
import { getStripe, updateStoreSubscription } from '../../../lib/integrations/stripe';

const mockedFindActive = SubscriptionService.findActiveStripeSubscriptions as jest.MockedFunction<
  typeof SubscriptionService.findActiveStripeSubscriptions
>;
const mockedUpdateStoreSubscription = updateStoreSubscription as jest.MockedFunction<
  typeof updateStoreSubscription
>;
const mockedStripe = getStripe() as any;

function mockResponse(owner?: string): express.Response {
  return {
    locals: { owner },
    redirect: jest.fn(),
  } as unknown as express.Response;
}

function mockRequest(): express.Request {
  return {} as express.Request;
}

describe('handleUploadLimitError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects unauthenticated users to login', async () => {
    const res = mockResponse(undefined);
    await handleUploadLimitError(mockRequest(), res);
    expect(res.redirect).toHaveBeenCalledWith('/login?error=upload_limit_exceeded');
  });

  it('redirects authenticated users with no Stripe subscription to pricing', async () => {
    (UsersService as jest.MockedClass<typeof UsersService>).prototype.getUserById =
      jest.fn().mockResolvedValue({ id: '1', email: 'user@example.com' });
    mockedFindActive.mockResolvedValue([]);

    const res = mockResponse('owner-1');
    await handleUploadLimitError(mockRequest(), res);

    expect(res.redirect).toHaveBeenCalledWith('/pricing?error=upload_limit_exceeded');
  });

  it('syncs subscription and redirects to upload when active Stripe sub exists but is missing from DB', async () => {
    (UsersService as jest.MockedClass<typeof UsersService>).prototype.getUserById =
      jest.fn().mockResolvedValue({ id: '1', email: 'user@example.com' });
    const fakeSub = { id: 'sub_123', customer: 'cus_123', status: 'active' } as any;
    mockedFindActive.mockResolvedValue([fakeSub]);
    mockedStripe.customers.retrieve.mockResolvedValue({ id: 'cus_123', email: 'user@example.com' });

    const res = mockResponse('owner-1');
    await handleUploadLimitError(mockRequest(), res);

    expect(mockedUpdateStoreSubscription).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/upload');
  });

  it('falls back to pricing redirect when Stripe call throws', async () => {
    (UsersService as jest.MockedClass<typeof UsersService>).prototype.getUserById =
      jest.fn().mockResolvedValue({ id: '1', email: 'user@example.com' });
    mockedFindActive.mockRejectedValue(new Error('Stripe unavailable'));

    const res = mockResponse('owner-1');
    await handleUploadLimitError(mockRequest(), res);

    expect(res.redirect).toHaveBeenCalledWith('/pricing?error=upload_limit_exceeded');
  });
});
