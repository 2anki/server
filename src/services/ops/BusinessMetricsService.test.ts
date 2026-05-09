jest.mock('../../lib/integrations/stripe', () => ({
  getStripe: jest.fn(),
}));

import {
  BusinessMetricsService,
  BusinessMetricsResponse,
} from './BusinessMetricsService';
import { ISubscriptionsAnalyticsRepository } from '../../data_layer/SubscriptionsAnalyticsRepository';

const buildFakeRepo = (
  overrides: Partial<ISubscriptionsAnalyticsRepository> = {}
): { repo: ISubscriptionsAnalyticsRepository; spies: Record<string, jest.Mock> } => {
  const spies = {
    mrrUsd: jest.fn().mockResolvedValue(4820),
    activePayingSubs: jest.fn().mockResolvedValue(184),
    netNewMrrMtdUsd: jest.fn().mockResolvedValue(312),
    newPaidConversions7d: jest.fn().mockResolvedValue(11),
    churn30dPct: jest.fn().mockResolvedValue(2.1),
  };
  const repo = {
    mrrUsd: overrides.mrrUsd ?? spies.mrrUsd,
    activePayingSubs: overrides.activePayingSubs ?? spies.activePayingSubs,
    netNewMrrMtdUsd: overrides.netNewMrrMtdUsd ?? spies.netNewMrrMtdUsd,
    newPaidConversions7d:
      overrides.newPaidConversions7d ?? spies.newPaidConversions7d,
    churn30dPct: overrides.churn30dPct ?? spies.churn30dPct,
  };
  return { repo, spies };
};

const buildFakeStripe = (failedCount: number = 4) => {
  const list = jest.fn().mockResolvedValue({
    data: Array.from({ length: failedCount }).map((_, idx) => ({
      id: `inv_${idx}`,
      status: 'open',
      attempt_count: 1,
      collection_method: 'charge_automatically',
    })),
    has_more: false,
  });
  return {
    invoices: { list },
    list,
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
    const { repo } = buildFakeRepo();
    const stripe = buildFakeStripe(4);
    const service = new BusinessMetricsService({
      repository: repo,
      stripeFactory: () => stripe as never,
    });

    const result: BusinessMetricsResponse = await service.getMetrics();

    expect(result.mrr_usd).toBe(4820);
    expect(result.active_paying_subs).toBe(184);
    expect(result.net_new_mrr_mtd_usd).toBe(312);
    expect(result.new_paid_conversions_7d).toBe(11);
    expect(result.churn_30d_pct).toBe(2.1);
    expect(result.failed_payments_7d).toBe(4);
    expect(result.as_of).toBe('2026-05-09T14:32:07.000Z');
    expect(result.cache_age_seconds).toBe(0);
    expect(result.errors).toBeUndefined();
  });

  it('serves cached values within 15 minutes', async () => {
    const { repo, spies } = buildFakeRepo();
    const stripe = buildFakeStripe(4);
    const service = new BusinessMetricsService({
      repository: repo,
      stripeFactory: () => stripe as never,
    });

    await service.getMetrics();
    jest.advanceTimersByTime(10 * 60 * 1000);
    const second = await service.getMetrics();

    expect(spies.mrrUsd).toHaveBeenCalledTimes(1);
    expect(spies.activePayingSubs).toHaveBeenCalledTimes(1);
    expect(stripe.invoices.list).toHaveBeenCalledTimes(1);
    expect(second.cache_age_seconds).toBe(10 * 60);
  });

  it('refetches metrics after cache expires', async () => {
    const { repo, spies } = buildFakeRepo();
    const stripe = buildFakeStripe(4);
    const service = new BusinessMetricsService({
      repository: repo,
      stripeFactory: () => stripe as never,
    });

    await service.getMetrics();
    jest.advanceTimersByTime(16 * 60 * 1000);
    await service.getMetrics();

    expect(spies.mrrUsd).toHaveBeenCalledTimes(2);
    expect(stripe.invoices.list).toHaveBeenCalledTimes(2);
  });

  it('returns null and reports the metric in errors on partial failure', async () => {
    const { repo } = buildFakeRepo({
      mrrUsd: jest.fn().mockRejectedValue(new Error('db boom')),
    });
    const stripe = buildFakeStripe(4);
    const service = new BusinessMetricsService({
      repository: repo,
      stripeFactory: () => stripe as never,
    });

    const result = await service.getMetrics();

    expect(result.mrr_usd).toBeNull();
    expect(result.active_paying_subs).toBe(184);
    expect(result.errors).toEqual([
      expect.objectContaining({ metric: 'mrr_usd', message: 'db boom' }),
    ]);
  });

  it('counts only open invoices with attempts as failed payments', async () => {
    const { repo } = buildFakeRepo();
    const list = jest.fn().mockResolvedValue({
      data: [
        { id: 'inv_open_attempts', status: 'open', attempt_count: 2 },
        { id: 'inv_open_no_attempt', status: 'open', attempt_count: 0 },
        { id: 'inv_paid', status: 'paid', attempt_count: 3 },
        { id: 'inv_void', status: 'void', attempt_count: 1 },
      ],
      has_more: false,
    });
    const stripe = { invoices: { list } };
    const service = new BusinessMetricsService({
      repository: repo,
      stripeFactory: () => stripe as never,
    });

    const result = await service.getMetrics();
    expect(result.failed_payments_7d).toBe(1);
  });
});
