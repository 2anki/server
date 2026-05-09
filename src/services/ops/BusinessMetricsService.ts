import type { Stripe } from 'stripe';

import { ISubscriptionsAnalyticsRepository } from '../../data_layer/SubscriptionsAnalyticsRepository';
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
  repository: ISubscriptionsAnalyticsRepository;
  stripeFactory?: () => Stripe;
  cacheTtlMs?: number;
}

const SECONDS_PER_DAY = 24 * 60 * 60;

export class BusinessMetricsService {
  private readonly repository: ISubscriptionsAnalyticsRepository;

  private readonly stripeFactory: () => Stripe;

  private readonly cacheTtlMs: number;

  private readonly cache = new Map<BusinessMetricKey, CacheEntry>();

  constructor(deps: BusinessMetricsServiceDeps) {
    this.repository = deps.repository;
    this.stripeFactory = deps.stripeFactory ?? (() => getStripe());
    this.cacheTtlMs = deps.cacheTtlMs ?? BUSINESS_METRICS_CACHE_TTL_MS;
  }

  async getMetrics(): Promise<BusinessMetricsResponse> {
    const now = new Date();
    const errors: BusinessMetricError[] = [];

    const tasks: Array<{
      key: BusinessMetricKey;
      fetch: () => Promise<number>;
    }> = [
      { key: 'mrr_usd', fetch: () => this.repository.mrrUsd(now) },
      {
        key: 'net_new_mrr_mtd_usd',
        fetch: () => this.repository.netNewMrrMtdUsd(now),
      },
      {
        key: 'active_paying_subs',
        fetch: () => this.repository.activePayingSubs(),
      },
      {
        key: 'churn_30d_pct',
        fetch: () => this.repository.churn30dPct(now),
      },
      {
        key: 'new_paid_conversions_7d',
        fetch: () => this.repository.newPaidConversions7d(now),
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

  private async fetchFailedPayments7d(now: Date): Promise<number> {
    const stripe = this.stripeFactory();
    const since = Math.floor(now.getTime() / 1000) - 7 * SECONDS_PER_DAY;
    const list = await stripe.invoices.list({
      collection_method: 'charge_automatically',
      created: { gte: since },
      limit: 100,
    });
    return list.data.filter(
      (invoice) =>
        invoice.status === 'open' && (invoice.attempt_count ?? 0) > 0
    ).length;
  }
}

export default BusinessMetricsService;
