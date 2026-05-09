jest.mock('../../lib/integrations/stripe', () => ({
  getStripe: jest.fn(),
}));

import {
  BusinessMetricsService,
  BusinessMetricsResponse,
} from './BusinessMetricsService';

interface FakeSubscriptionItem {
  price: {
    unit_amount: number | null;
    recurring: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count?: number;
    } | null;
  };
  quantity?: number;
}

interface FakeSubscription {
  id: string;
  status?: 'active' | 'canceled' | 'trialing' | 'past_due';
  items: { data: FakeSubscriptionItem[] };
}

const monthly = (
  cents: number,
  quantity: number = 1,
  intervalCount: number = 1
): FakeSubscriptionItem => ({
  price: {
    unit_amount: cents,
    recurring: { interval: 'month', interval_count: intervalCount },
  },
  quantity,
});

const yearly = (cents: number, quantity: number = 1): FakeSubscriptionItem => ({
  price: {
    unit_amount: cents,
    recurring: { interval: 'year', interval_count: 1 },
  },
  quantity,
});

const weekly = (cents: number): FakeSubscriptionItem => ({
  price: {
    unit_amount: cents,
    recurring: { interval: 'week', interval_count: 1 },
  },
  quantity: 1,
});

const sub = (
  id: string,
  items: FakeSubscriptionItem[],
  status: FakeSubscription['status'] = 'active'
): FakeSubscription => ({
  id,
  status,
  items: { data: items },
});

interface FakeStripeOptions {
  activeSubs?: FakeSubscription[];
  newThisMonth?: FakeSubscription[];
  newLast7d?: FakeSubscription[];
  canceledLast30d?: FakeSubscription[];
  invoices?: Array<{
    id: string;
    status: string;
    attempt_count: number;
  }>;
}

const buildFakeStripe = (options: FakeStripeOptions = {}) => {
  const subscriptionsList = jest.fn(async ({ status, created }: any) => {
    if (status === 'active') {
      return { data: options.activeSubs ?? [], has_more: false };
    }
    const since = created?.gte ?? 0;
    const todayUtc = Date.UTC(2026, 4, 9);
    const startOfMonth = Math.floor(Date.UTC(2026, 4, 1) / 1000);
    if (since === startOfMonth) {
      return { data: options.newThisMonth ?? [], has_more: false };
    }
    const sevenDaysAgo = Math.floor(todayUtc / 1000) - 7 * 86400;
    if (since <= sevenDaysAgo + 86400 && since >= sevenDaysAgo - 86400) {
      return { data: options.newLast7d ?? [], has_more: false };
    }
    return { data: [], has_more: false };
  });
  const subscriptionsSearch = jest.fn(async () => ({
    data: options.canceledLast30d ?? [],
    has_more: false,
    next_page: null,
  }));
  const invoicesList = jest.fn(async () => ({
    data: options.invoices ?? [],
    has_more: false,
  }));
  return {
    subscriptions: { list: subscriptionsList, search: subscriptionsSearch },
    invoices: { list: invoicesList },
  };
};

describe('BusinessMetricsService', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date('2026-05-09T14:32:07Z').getTime(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the full response shape on first call', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [
        sub('sub_1', [monthly(2000)]),
        sub('sub_2', [monthly(2820)]),
      ],
      newThisMonth: [sub('sub_new1', [monthly(312_00)])],
      newLast7d: Array.from({ length: 11 }).map((_, i) =>
        sub(`sub_n_${i}`, [monthly(1000)])
      ),
      canceledLast30d: Array.from({ length: 4 }).map((_, i) =>
        sub(`sub_c_${i}`, [], 'canceled')
      ),
      invoices: [
        { id: 'inv_1', status: 'open', attempt_count: 1 },
        { id: 'inv_2', status: 'open', attempt_count: 1 },
        { id: 'inv_3', status: 'open', attempt_count: 1 },
        { id: 'inv_4', status: 'open', attempt_count: 1 },
        { id: 'inv_paid', status: 'paid', attempt_count: 0 },
      ],
    });

    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    const result: BusinessMetricsResponse = await service.getMetrics();

    expect(result.mrr_usd).toBeCloseTo(48.2, 5);
    expect(result.active_paying_subs).toBe(2);
    expect(result.net_new_mrr_mtd_usd).toBeCloseTo(312, 5);
    expect(result.new_paid_conversions_7d).toBe(11);
    expect(result.churn_30d_pct).toBe((4 / 2) * 100);
    expect(result.failed_payments_7d).toBe(4);
    expect(result.as_of).toBe('2026-05-09T14:32:07.000Z');
    expect(result.cache_age_seconds).toBe(0);
    expect(result.errors).toBeUndefined();
  });

  it('serves cached values within 15 minutes', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [sub('sub_1', [monthly(1000)])],
    });
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    await service.getMetrics();
    jest.advanceTimersByTime(10 * 60 * 1000);
    const second = await service.getMetrics();

    expect(stripe.subscriptions.list).toHaveBeenCalledTimes(3);
    expect(stripe.subscriptions.search).toHaveBeenCalledTimes(1);
    expect(stripe.invoices.list).toHaveBeenCalledTimes(1);
    expect(second.cache_age_seconds).toBe(10 * 60);
  });

  it('refetches metrics after cache expires', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [sub('sub_1', [monthly(1000)])],
    });
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    await service.getMetrics();
    jest.advanceTimersByTime(16 * 60 * 1000);
    await service.getMetrics();

    expect(stripe.subscriptions.list).toHaveBeenCalledTimes(6);
    expect(stripe.invoices.list).toHaveBeenCalledTimes(2);
  });

  it('normalizes yearly and weekly subs into monthly MRR', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [
        sub('sub_year', [yearly(120_00)]),
        sub('sub_week', [weekly(1000)]),
      ],
    });
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    const result = await service.getMetrics();
    const expectedYearly = 12000 / 12;
    const expectedWeekly = 1000 * 4.33;
    const expectedUsd = (expectedYearly + expectedWeekly) / 100;
    expect(result.mrr_usd).toBeCloseTo(expectedUsd, 5);
    expect(result.active_paying_subs).toBe(2);
  });

  it('excludes trialing subscriptions from MRR and active count', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [
        sub('sub_active', [monthly(1500)]),
        sub('sub_trialing', [monthly(99_99)], 'trialing'),
      ],
    });
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    const result = await service.getMetrics();
    expect(result.active_paying_subs).toBe(1);
    expect(result.mrr_usd).toBeCloseTo(15, 5);
  });

  it('sums MRR across multiple items in one subscription', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [sub('sub_multi', [monthly(1000, 2), monthly(500)])],
    });
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    const result = await service.getMetrics();
    expect(result.mrr_usd).toBeCloseTo(25, 5);
    expect(result.active_paying_subs).toBe(1);
  });

  it('shares one paginated walk between mrr_usd and active_paying_subs', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [sub('sub_1', [monthly(1000)])],
    });
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    await service.getMetrics();

    const activeListCalls = (stripe.subscriptions.list as jest.Mock).mock.calls.filter(
      ([args]) => args.status === 'active'
    );
    expect(activeListCalls).toHaveLength(1);
  });

  it('returns null and reports the metric in errors on partial failure', async () => {
    const stripe = buildFakeStripe({
      activeSubs: [sub('sub_1', [monthly(1000)])],
    });
    (stripe.invoices.list as jest.Mock).mockRejectedValueOnce(
      new Error('stripe boom')
    );
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    const result = await service.getMetrics();

    expect(result.failed_payments_7d).toBeNull();
    expect(result.mrr_usd).toBeCloseTo(10, 5);
    expect(result.errors).toEqual([
      expect.objectContaining({
        metric: 'failed_payments_7d',
        message: 'stripe boom',
      }),
    ]);
  });

  it('counts only open invoices with attempts as failed payments', async () => {
    const stripe = buildFakeStripe({
      invoices: [
        { id: 'inv_open_attempts', status: 'open', attempt_count: 2 },
        { id: 'inv_open_no_attempt', status: 'open', attempt_count: 0 },
        { id: 'inv_paid', status: 'paid', attempt_count: 3 },
        { id: 'inv_void', status: 'void', attempt_count: 1 },
      ],
    });
    const service = new BusinessMetricsService({
      stripeFactory: () => stripe as never,
    });

    const result = await service.getMetrics();
    expect(result.failed_payments_7d).toBe(1);
  });
});
