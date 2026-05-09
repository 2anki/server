import type { Stripe } from 'stripe';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';

import { getStripe } from '../../lib/integrations/stripe';

export type BusinessMetricKey =
  | 'mrr_usd'
  | 'net_new_mrr_mtd_usd'
  | 'active_paying_subs'
  | 'churn_30d_pct'
  | 'failed_payments_7d'
  | 'new_paid_conversions_7d';

export interface BusinessMetricError {
  metric: BusinessMetricKey;
  message: string;
}

export interface BusinessMetricsResponse {
  mrr_usd: number | null;
  net_new_mrr_mtd_usd: number | null;
  active_paying_subs: number | null;
  churn_30d_pct: number | null;
  failed_payments_7d: number | null;
  new_paid_conversions_7d: number | null;
  as_of: string;
  cache_age_seconds: number;
  errors?: BusinessMetricError[];
}

interface CacheEntry {
  value: number;
  expiresAt: number;
  cachedAt: number;
}

export const BUSINESS_METRICS_CACHE_TTL_MS = 15 * 60 * 1000;

interface BusinessMetricsServiceDeps {
  stripeFactory?: () => Stripe;
  cacheTtlMs?: number;
}

const SECONDS_PER_DAY = 24 * 60 * 60;
const STRIPE_PAGE_LIMIT = 100;

const INTERVAL_TO_MONTHLY_FACTOR: Record<string, number> = {
  month: 1,
  year: 1 / 12,
  week: 4.33,
  day: 30,
};

interface ActiveSubsAggregate {
  mrrUsd: number;
  count: number;
}

export class BusinessMetricsService {
  private readonly stripeFactory: () => Stripe;

  private readonly cacheTtlMs: number;

  private readonly cache = new Map<BusinessMetricKey, CacheEntry>();

  private activeAggregatePromise: Promise<ActiveSubsAggregate> | null = null;

  constructor(deps: BusinessMetricsServiceDeps = {}) {
    this.stripeFactory = deps.stripeFactory ?? (() => getStripe());
    this.cacheTtlMs = deps.cacheTtlMs ?? BUSINESS_METRICS_CACHE_TTL_MS;
  }

  async getMetrics(): Promise<BusinessMetricsResponse> {
    const now = new Date();
    const errors: BusinessMetricError[] = [];

    this.activeAggregatePromise = null;

    const tasks: Array<{
      key: BusinessMetricKey;
      fetch: () => Promise<number>;
    }> = [
      {
        key: 'mrr_usd',
        fetch: async () => (await this.loadActiveAggregate()).mrrUsd,
      },
      {
        key: 'active_paying_subs',
        fetch: async () => (await this.loadActiveAggregate()).count,
      },
      {
        key: 'net_new_mrr_mtd_usd',
        fetch: () => this.fetchNetNewMrrMtdUsd(now),
      },
      {
        key: 'new_paid_conversions_7d',
        fetch: () => this.fetchNewPaidConversions7d(now),
      },
      {
        key: 'churn_30d_pct',
        fetch: () => this.fetchChurn30dPct(now),
      },
      {
        key: 'failed_payments_7d',
        fetch: () => this.fetchFailedPayments7d(now),
      },
    ];

    const settled = await Promise.all(
      tasks.map(({ key, fetch }) =>
        this.resolveMetric(key, fetch, now).catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error);
          errors.push({ metric: key, message });
          return null;
        })
      )
    );

    const valueByKey: Record<BusinessMetricKey, number | null> = {
      mrr_usd: null,
      net_new_mrr_mtd_usd: null,
      active_paying_subs: null,
      churn_30d_pct: null,
      failed_payments_7d: null,
      new_paid_conversions_7d: null,
    };
    tasks.forEach(({ key }, idx) => {
      valueByKey[key] = settled[idx];
    });

    const cacheAgeSeconds = this.cacheAgeSeconds(now);

    const response: BusinessMetricsResponse = {
      mrr_usd: valueByKey.mrr_usd,
      net_new_mrr_mtd_usd: valueByKey.net_new_mrr_mtd_usd,
      active_paying_subs: valueByKey.active_paying_subs,
      churn_30d_pct: valueByKey.churn_30d_pct,
      failed_payments_7d: valueByKey.failed_payments_7d,
      new_paid_conversions_7d: valueByKey.new_paid_conversions_7d,
      as_of: now.toISOString(),
      cache_age_seconds: cacheAgeSeconds,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return response;
  }

  private async resolveMetric(
    key: BusinessMetricKey,
    fetcher: () => Promise<number>,
    now: Date
  ): Promise<number> {
    const existing = this.cache.get(key);
    if (existing != null && existing.expiresAt > now.getTime()) {
      return existing.value;
    }
    const value = await fetcher();
    this.cache.set(key, {
      value,
      cachedAt: now.getTime(),
      expiresAt: now.getTime() + this.cacheTtlMs,
    });
    return value;
  }

  private cacheAgeSeconds(now: Date): number {
    let oldest = now.getTime();
    for (const entry of this.cache.values()) {
      if (entry.cachedAt < oldest) {
        oldest = entry.cachedAt;
      }
    }
    return Math.max(0, Math.floor((now.getTime() - oldest) / 1000));
  }

  private loadActiveAggregate(): Promise<ActiveSubsAggregate> {
    const cachedMrr = this.cache.get('mrr_usd');
    const cachedCount = this.cache.get('active_paying_subs');
    const nowMs = Date.now();
    const mrrFresh = cachedMrr != null && cachedMrr.expiresAt > nowMs;
    const countFresh = cachedCount != null && cachedCount.expiresAt > nowMs;
    if (mrrFresh && countFresh) {
      return Promise.resolve({
        mrrUsd: cachedMrr!.value,
        count: cachedCount!.value,
      });
    }
    if (this.activeAggregatePromise == null) {
      this.activeAggregatePromise = this.fetchActiveAggregate();
    }
    return this.activeAggregatePromise;
  }

  private async fetchActiveAggregate(): Promise<ActiveSubsAggregate> {
    const stripe = this.stripeFactory();
    let mrrCents = 0;
    let count = 0;
    let startingAfter: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const page: StripeTypes.ApiList<StripeTypes.Subscription> =
        await stripe.subscriptions.list({
          status: 'active',
          limit: STRIPE_PAGE_LIMIT,
          starting_after: startingAfter,
        });
      for (const sub of page.data) {
        if (sub.status !== 'active') {
          continue;
        }
        count += 1;
        mrrCents += monthlyCentsForSubscription(sub);
      }
      hasMore = page.has_more === true && page.data.length > 0;
      startingAfter = hasMore ? page.data[page.data.length - 1].id : undefined;
    }
    return { mrrUsd: mrrCents / 100, count };
  }

  private async fetchNetNewMrrMtdUsd(now: Date): Promise<number> {
    const stripe = this.stripeFactory();
    const since = startOfMonthEpochSeconds(now);
    let mrrCents = 0;
    let startingAfter: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const page: StripeTypes.ApiList<StripeTypes.Subscription> =
        await stripe.subscriptions.list({
          created: { gte: since },
          limit: STRIPE_PAGE_LIMIT,
          starting_after: startingAfter,
        });
      for (const sub of page.data) {
        mrrCents += monthlyCentsForSubscription(sub);
      }
      hasMore = page.has_more === true && page.data.length > 0;
      startingAfter = hasMore ? page.data[page.data.length - 1].id : undefined;
    }
    return mrrCents / 100;
  }

  private async fetchNewPaidConversions7d(now: Date): Promise<number> {
    const stripe = this.stripeFactory();
    const since = epochSecondsDaysAgo(now, 7);
    let count = 0;
    let startingAfter: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const page: StripeTypes.ApiList<StripeTypes.Subscription> =
        await stripe.subscriptions.list({
          created: { gte: since },
          limit: STRIPE_PAGE_LIMIT,
          starting_after: startingAfter,
        });
      count += page.data.length;
      hasMore = page.has_more === true && page.data.length > 0;
      startingAfter = hasMore ? page.data[page.data.length - 1].id : undefined;
    }
    return count;
  }

  private async fetchChurn30dPct(now: Date): Promise<number> {
    const since = epochSecondsDaysAgo(now, 30);
    const [canceledCount, activeAggregate] = await Promise.all([
      this.fetchCanceledSince(since),
      this.loadActiveAggregate(),
    ]);
    if (activeAggregate.count === 0) {
      return 0;
    }
    return (canceledCount / activeAggregate.count) * 100;
  }

  private async fetchCanceledSince(sinceEpoch: number): Promise<number> {
    const stripe = this.stripeFactory();
    let count = 0;
    let page: StripeTypes.ApiSearchResult<StripeTypes.Subscription> =
      await stripe.subscriptions.search({
        query: `canceled_at>:${sinceEpoch}`,
        limit: STRIPE_PAGE_LIMIT,
      });
    count += page.data.length;
    while (page.has_more === true && page.next_page != null) {
      page = await stripe.subscriptions.search({
        query: `canceled_at>:${sinceEpoch}`,
        limit: STRIPE_PAGE_LIMIT,
        page: page.next_page,
      });
      count += page.data.length;
    }
    return count;
  }

  private async fetchFailedPayments7d(now: Date): Promise<number> {
    const stripe = this.stripeFactory();
    const since = epochSecondsDaysAgo(now, 7);
    let count = 0;
    let startingAfter: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const page: StripeTypes.ApiList<StripeTypes.Invoice> =
        await stripe.invoices.list({
          collection_method: 'charge_automatically',
          created: { gte: since },
          limit: STRIPE_PAGE_LIMIT,
          starting_after: startingAfter,
        });
      for (const invoice of page.data) {
        if (invoice.status === 'open' && (invoice.attempt_count ?? 0) > 0) {
          count += 1;
        }
      }
      hasMore = page.has_more === true && page.data.length > 0;
      startingAfter = hasMore ? page.data[page.data.length - 1].id : undefined;
    }
    return count;
  }
}

const monthlyCentsForSubscription = (
  subscription: StripeTypes.Subscription
): number => {
  const items = subscription.items?.data ?? [];
  let total = 0;
  for (const item of items) {
    const price = item.price;
    const recurring = price?.recurring;
    if (recurring == null) {
      continue;
    }
    const unitAmount = price?.unit_amount;
    if (unitAmount == null) {
      continue;
    }
    const quantity = item.quantity ?? 1;
    const intervalCount = recurring.interval_count ?? 1;
    const factor = INTERVAL_TO_MONTHLY_FACTOR[recurring.interval];
    if (factor == null) {
      continue;
    }
    total += (unitAmount * quantity * factor) / intervalCount;
  }
  return total;
};

const startOfMonthEpochSeconds = (now: Date): number => {
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );
  return Math.floor(monthStart.getTime() / 1000);
};

const epochSecondsDaysAgo = (now: Date, days: number): number => {
  return Math.floor(now.getTime() / 1000) - days * SECONDS_PER_DAY;
};

export default BusinessMetricsService;
