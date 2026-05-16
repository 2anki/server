import express from 'express';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { InMemoryUserPassRepository } from '../data_layer/UserPassRepository';

const mockUpsert = jest.fn();
const inMemoryRepo = new InMemoryUserPassRepository();

jest.mock('../lib/integrations/stripe', () => ({
  getStripe: jest.fn().mockReturnValue({
    webhooks: {
      constructEvent: jest.fn((_body: Buffer, _sig: string) => mockWebhookEvent),
    },
  }),
  getCustomerId: jest.fn(),
  updateStoreSubscription: jest.fn(),
}));

jest.mock('../data_layer', () => ({ getDatabase: jest.fn() }));

jest.mock('../data_layer/UserPassRepository', () => {
  const { InMemoryUserPassRepository: Mem } = jest.requireActual('../data_layer/UserPassRepository');
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({ upsertWithExtension: mockUpsert })),
    InMemoryUserPassRepository: Mem,
  };
});

jest.mock('../data_layer/UsersRepository', () => jest.fn().mockImplementation(() => ({})));

jest.mock('../lib/misc/hashToken', () => (s: string) => `hashed:${s}`);

jest.mock('../services/GA4Service', () => ({
  sendPurchaseEvent: jest.fn().mockResolvedValue(undefined),
}));

let mockWebhookEvent: { type: string; data: { object: Record<string, unknown> } };

async function buildServer() {
  const { default: WebhooksRouter } = await import('./WebhookRouter');
  const app = express();
  app.use(WebhooksRouter());
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return { server, url: `http://127.0.0.1:${port}` };
}

function makePassSessionEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test',
        amount_total: 400,
        currency: 'usd',
        customer: null,
        payment_intent: 'pi_test_123',
        metadata: { user_id: '42', pass_kind: '24h' },
        ...overrides,
      },
    },
  };
}

describe('WebhookRouter — pass grant', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    ({ server, url } = await buildServer());
  });

  afterAll(() => server.close());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function postWebhook() {
    return fetch(`${url}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig_test' },
      body: JSON.stringify({}),
    });
  }

  it('grants 24h pass on checkout.session.completed with pass_kind=24h', async () => {
    mockWebhookEvent = makePassSessionEvent();
    mockUpsert.mockResolvedValue({
      id: 1, user_id: 42, kind: '24h',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      stripe_payment_intent_id: 'pi_test_123',
    });

    const res = await postWebhook();
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      42, '24h', 24 * 60 * 60 * 1000, 'pi_test_123', expect.any(Date)
    );
  });

  it('grants 7d pass on checkout.session.completed with pass_kind=7d', async () => {
    mockWebhookEvent = makePassSessionEvent({ metadata: { user_id: '7', pass_kind: '7d' }, payment_intent: 'pi_7d' });
    mockUpsert.mockResolvedValue({
      id: 2, user_id: 7, kind: '7d',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      stripe_payment_intent_id: 'pi_7d',
    });

    const res = await postWebhook();
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      7, '7d', 7 * 24 * 60 * 60 * 1000, 'pi_7d', expect.any(Date)
    );
  });

  it('returns 200 without calling upsert when user_id metadata is missing', async () => {
    mockWebhookEvent = makePassSessionEvent({ metadata: { pass_kind: '24h' } });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const res = await postWebhook();
    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('pass.webhook.missing_metadata', expect.anything());
    warnSpy.mockRestore();
  });

  it('returns 200 without calling upsert when user_id is not a valid integer', async () => {
    mockWebhookEvent = makePassSessionEvent({ metadata: { user_id: 'not-a-number', pass_kind: '24h' } });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const res = await postWebhook();
    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('logs pass.granted with hashed payment intent (not raw)', async () => {
    mockWebhookEvent = makePassSessionEvent();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    mockUpsert.mockResolvedValue({
      id: 1, user_id: 42, kind: '24h', expires_at: expiresAt, stripe_payment_intent_id: 'pi_test_123',
    });
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    await postWebhook();
    const passGrantedCall = infoSpy.mock.calls.find(([msg]) => msg === 'pass.granted');
    expect(passGrantedCall).toBeDefined();
    const logData = passGrantedCall?.[1] as Record<string, unknown>;
    expect(logData.payment_intent_id_hash).toBe('hashed:pi_test_123');
    expect(logData).not.toHaveProperty('pi_test_123');
    infoSpy.mockRestore();
  });

  it('does not call upsert for non-pass checkout sessions', async () => {
    mockWebhookEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_lifetime',
          amount_total: 9600,
          currency: 'usd',
          customer: 'cus_abc',
          payment_intent: null,
          metadata: { user_id: '1' },
        },
      },
    };

    const res = await postWebhook();
    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
