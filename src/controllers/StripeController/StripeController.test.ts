import express from 'express';
import { StripeController } from './StripeController';

jest.mock('../../data_layer', () => ({
  getDatabase: jest.fn().mockReturnValue({}),
}));

jest.mock('../../services/EmailService/EmailService', () => ({
  getDefaultEmailService: jest.fn().mockReturnValue({}),
}));

jest.mock('./extractTokenFromCookies', () => ({
  extractTokenFromCookies: jest.fn(),
}));

jest.mock('../../services/SubscriptionService', () => ({
  getUserActiveSubscriptions: jest.fn(),
}));

jest.mock('../../lib/integrations/stripe', () => ({
  getStripe: jest.fn().mockReturnValue({
    checkout: {
      sessions: {
        retrieve: jest.fn(),
      },
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
    customers: {
      retrieve: jest.fn(),
    },
  }),
  updateStoreSubscription: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/AuthenticationService');
jest.mock('../../data_layer/TokenRepository');
jest.mock('../../data_layer/UsersRepository');
jest.mock('../../services/UsersService');
jest.mock('../IndexController/getIndexFileContents', () => ({
  getIndexFileContents: jest.fn().mockReturnValue('<html/>'),
}));

import { extractTokenFromCookies } from './extractTokenFromCookies';
import SubscriptionService from '../../services/SubscriptionService';
import { getStripe, updateStoreSubscription } from '../../lib/integrations/stripe';
import AuthenticationService from '../../services/AuthenticationService';
import UsersService from '../../services/UsersService';

const mockedExtractToken = extractTokenFromCookies as jest.MockedFunction<typeof extractTokenFromCookies>;
const mockedGetActiveSubscriptions = SubscriptionService.getUserActiveSubscriptions as jest.MockedFunction<typeof SubscriptionService.getUserActiveSubscriptions>;
const mockedUpdateStoreSubscription = updateStoreSubscription as jest.MockedFunction<typeof updateStoreSubscription>;
const mockedStripe = getStripe() as any;

function mockRequest(query: Record<string, string> = {}, cookies?: string): express.Request {
  return {
    get: jest.fn().mockReturnValue(cookies || 'token=abc'),
    query,
  } as unknown as express.Request;
}

function mockResponse(): express.Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as express.Response;
  return res;
}

function setupAuthenticatedUser(user = { email: 'test@example.com', name: 'Test', patreon: false }) {
  mockedExtractToken.mockReturnValue('abc');
  (AuthenticationService as jest.MockedClass<typeof AuthenticationService>).prototype.getUserFrom = jest.fn().mockResolvedValue(user);
}

describe('StripeController', () => {
  let controller: StripeController;

  beforeEach(() => {
    controller = new StripeController();
    jest.clearAllMocks();
  });

  describe('checkSubscriptionStatus', () => {
    it('returns hasActiveSubscription true when session_id is provided and session is paid', async () => {
      setupAuthenticatedUser();
      mockedGetActiveSubscriptions.mockResolvedValue([]);
      mockedStripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_status: 'paid',
        subscription: 'sub_123',
      });
      mockedStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
      });
      mockedStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_123',
        email: 'test@example.com',
      });

      const req = mockRequest({ session_id: 'cs_test_123' });
      const res = mockResponse();

      await controller.checkSubscriptionStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ hasActiveSubscription: true })
      );
    });

    it('returns hasActiveSubscription true when user has patreon flag', async () => {
      setupAuthenticatedUser({ email: 'test@example.com', name: 'Test', patreon: true });
      mockedGetActiveSubscriptions.mockResolvedValue([]);

      const req = mockRequest();
      const res = mockResponse();

      await controller.checkSubscriptionStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ hasActiveSubscription: true })
      );
    });

    it('returns hasActiveSubscription true when DB has active subscription', async () => {
      setupAuthenticatedUser();
      mockedGetActiveSubscriptions.mockResolvedValue([{ id: 1, email: 'test@example.com', active: true } as any]);

      const req = mockRequest();
      const res = mockResponse();

      await controller.checkSubscriptionStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ hasActiveSubscription: true })
      );
    });

    it('returns hasActiveSubscription false when no subscription found anywhere', async () => {
      setupAuthenticatedUser();
      mockedGetActiveSubscriptions.mockResolvedValue([]);

      const req = mockRequest();
      const res = mockResponse();

      await controller.checkSubscriptionStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ hasActiveSubscription: false })
      );
    });
  });

  describe('getSuccessfulCheckout', () => {
    function setupStripeSession(stripeEmail: string) {
      mockedStripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_status: 'paid',
        subscription: 'sub_123',
        customer_details: { email: stripeEmail },
      });
      mockedStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        cancel_at_period_end: false,
      });
      mockedStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_123',
        email: stripeEmail,
      });
    }

    it('persists the subscription before linking when emails differ', async () => {
      setupAuthenticatedUser({ email: 'user@2anki.com', name: 'Test', patreon: false });
      setupStripeSession('paypal@email.com');
      (UsersService as jest.MockedClass<typeof UsersService>).prototype.updateSubScriptionEmailUsingPrimaryEmail = jest.fn().mockResolvedValue(1);

      const req = mockRequest({ session_id: 'cs_test_123' });
      const res = mockResponse();

      await controller.getSuccessfulCheckout(req, res);

      expect(mockedUpdateStoreSubscription).toHaveBeenCalled();
      expect((UsersService as jest.MockedClass<typeof UsersService>).prototype.updateSubScriptionEmailUsingPrimaryEmail)
        .toHaveBeenCalledWith('paypal@email.com', 'user@2anki.com');
    });

    it('does not link when session email matches the logged-in email', async () => {
      setupAuthenticatedUser({ email: 'user@2anki.com', name: 'Test', patreon: false });
      setupStripeSession('user@2anki.com');
      (UsersService as jest.MockedClass<typeof UsersService>).prototype.updateSubScriptionEmailUsingPrimaryEmail = jest.fn();

      const req = mockRequest({ session_id: 'cs_test_123' });
      const res = mockResponse();

      await controller.getSuccessfulCheckout(req, res);

      expect((UsersService as jest.MockedClass<typeof UsersService>).prototype.updateSubScriptionEmailUsingPrimaryEmail)
        .not.toHaveBeenCalled();
    });

    it('serves the page without error when no token present', async () => {
      mockedExtractToken.mockReturnValue(null as any);

      const req = mockRequest({ session_id: 'cs_test_123' });
      const res = mockResponse();

      await controller.getSuccessfulCheckout(req, res);

      expect(res.send).toHaveBeenCalled();
      expect(mockedUpdateStoreSubscription).not.toHaveBeenCalled();
    });
  });
});
