import type { Stripe } from 'stripe';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';

import { getStripe } from '../../lib/integrations/stripe';
import {
  BusinessMetricsCacheEntry,
  IBusinessMetricsCacheRepository,
  InMemoryBusinessMetricsCacheRepository,
} from '../../data_layer/BusinessMetricsCacheRepository';
import {
  CancellationCommentEntry,
  CancellationReasonCount,
  ICancellationFeedbackRepository,
  InMemoryCancellationFeedbackRepository,
} from '../../data_layer/CancellationFeedbackRepository';
import {
  IEmojiFeedbackRepository,
  InMemoryEmojiFeedbackRepository,
} from '../../data_layer/EmojiFeedbackRepository';

export type BusinessMetricKey =
  | 'mrr_usd'
  | 'net_new_mrr_mtd_usd'
  | 'active_paying_subs'
  | 'churn_30d_pct'
  | 'failed_payments_7d'
  | 'new_paid_conversions_7d'
  | 'mrr_timeseries'
  | 'active_subs_timeseries'
  | 'conversions_vs_churn_weekly'
  | 'failed_payments_weekly'
  | 'cancellation_reasons_top'
  | 'cancellation_comments_recent'
  | 'emoji_feedback_ratings'
  | 'emoji_feedback_comments';

export interface BusinessMetricError {
  metric: BusinessMetricKey;
  message: string;
}

export interface MrrTimeseriesPoint {
  t: string;
  mrr_usd: number;
}

export interface ActiveSubsTimeseriesPoint {
  t: string;
  active_paying_subs: number;
}

export interface ConversionsChurnWeekPoint {
  week: string;
  new_paying: number;
  churned: number;
}

export interface FailedPaymentsWeekPoint {
  week: string;
  count: number;
}

export interface BusinessMetricsResponse {
  mrr_usd: number | null;
  net_new_mrr_mtd_usd: number | null;
  active_paying_subs: number | null;
  churn_30d_pct: number | null;
  failed_payments_7d: number | null;
  new_paid_conversions_7d: number | null;
  mrr_timeseries: MrrTimeseriesPoint[] | null;
  active_subs_timeseries: ActiveSubsTimeseriesPoint[] | null;
  conversions_vs_churn_weekly: ConversionsChurnWeekPoint[] | null;
  failed_payments_weekly: FailedPaymentsWeekPoint[] | null;
  cancellation_reasons_top: CancellationReasonCount[] | null;
  cancellation_comments_recent: CancellationCommentEntry[] | null;
  as_of: string;
  cache_age_seconds: number;
  errors?: BusinessMetricError[];
}

export const BUSINESS_METRICS_CACHE_TTL_MS = 15 * 60 * 1000;
export const CANCELLATION_REASONS_LOOKBACK_DAYS = 90;
export const CANCELLATION_COMMENTS_LIMIT = 20;
export const EMOJI_FEEDBACK_LOOKBACK_DAYS = 30;
export const EMOJI_FEEDBACK_COMMENTS_LIMIT = 20;

interface BusinessMetricsServiceDeps {
  stripeFactory?: () => Stripe;
  cacheTtlMs?: number;
  cacheRepository?: IBusinessMetricsCacheRepository;
  cancellationRepository?: ICancellationFeedbackRepository;
  emojiFeedbackRepository?: IEmojiFeedbackRepository;
}

const SECONDS_PER_DAY = 24 * 60 * 60;
const STRIPE_PAGE_LIMIT = 100;
const MRR_HISTORY_DAYS = 90;
const WEEKLY_HISTORY_WEEKS = 12;
const FAILED_INVOICES_LOOKBACK_DAYS = WEEKLY_HISTORY_WEEKS * 7;

const INTERVAL_TO_MONTHLY_FACTOR: Record<string, number> = {
  month: 1,
  year: 1 / 12,
  week: 4.33,
  day: 30,
};

interface NormalizedSubscription {
  id: string;
  status: string;
  createdMs: number;
  endedAtMs: number | null;
  monthlyCents: number;
}

interface NormalizedInvoice {
  id: string;
  status: string;
  attemptCount: number;
  createdMs: number;
}

export class BusinessMetricsService {
  private readonly stripeFactory: () => Stripe;

  private readonly cacheTtlMs: number;

  private readonly cacheRepository: IBusinessMetricsCacheRepository;

  private readonly cancellationRepository: ICancellationFeedbackRepository;

  private readonly emojiFeedbackRepository: IEmojiFeedbackRepository;

  private allSubsPromise: Promise<NormalizedSubscription[]> | null = null;

  private invoicesPromise: Promise<NormalizedInvoice[]> | null = null;

  constructor(deps: BusinessMetricsServiceDeps = {}) {
    this.stripeFactory = deps.stripeFactory ?? (() => getStripe());
    this.cacheTtlMs = deps.cacheTtlMs ?? BUSINESS_METRICS_CACHE_TTL_MS;
    this.cacheRepository =
      deps.cacheRepository ?? new InMemoryBusinessMetricsCacheRepository();
    this.cancellationRepository =
      deps.cancellationRepository ??
      new InMemoryCancellationFeedbackRepository();
    this.emojiFeedbackRepository =
      deps.emojiFeedbackRepository ??
      new InMemoryEmojiFeedbackRepository();
  }

  async getMetrics(): Promise<BusinessMetricsResponse> {
    const now = new Date();
    const errors: BusinessMetricError[] = [];

    this.allSubsPromise = null;
    this.invoicesPromise = null;

    const cachedByKey = await this.loadCacheMap();

    const subDerived = (computer: (subs: NormalizedSubscription[]) => unknown) =>
      async () => computer(await this.loadAllSubs());
    const invoiceDerived = (
      computer: (invoices: NormalizedInvoice[]) => unknown
    ) => async () => computer(await this.loadInvoices(now));

    const tasks: Array<{
      key: BusinessMetricKey;
      fetch: () => Promise<unknown>;
    }> = [
      { key: 'mrr_usd', fetch: subDerived((s) => computeMrrUsd(s, now)) },
      {
        key: 'active_paying_subs',
        fetch: subDerived((s) => computeActiveCount(s, now)),
      },
      {
        key: 'net_new_mrr_mtd_usd',
        fetch: subDerived((s) => computeNetNewMrrMtdUsd(s, now)),
      },
      {
        key: 'new_paid_conversions_7d',
        fetch: subDerived((s) => computeNewPaidConversions7d(s, now)),
      },
      { key: 'churn_30d_pct', fetch: subDerived((s) => computeChurn30dPct(s, now)) },
      {
        key: 'failed_payments_7d',
        fetch: invoiceDerived((i) => computeFailedPayments7d(i, now)),
      },
      {
        key: 'mrr_timeseries',
        fetch: subDerived((s) => computeMrrTimeseries(s, now)),
      },
      {
        key: 'active_subs_timeseries',
        fetch: subDerived((s) => computeActiveSubsTimeseries(s, now)),
      },
      {
        key: 'conversions_vs_churn_weekly',
        fetch: subDerived((s) => computeConversionsChurnWeekly(s, now)),
      },
      {
        key: 'failed_payments_weekly',
        fetch: invoiceDerived((i) => computeFailedPaymentsWeekly(i, now)),
      },
      {
        key: 'cancellation_reasons_top',
        fetch: () =>
          this.cancellationRepository.countByReason(
            new Date(
              now.getTime() -
                CANCELLATION_REASONS_LOOKBACK_DAYS * SECONDS_PER_DAY * 1000
            )
          ),
      },
      {
        key: 'cancellation_comments_recent',
        fetch: () =>
          this.cancellationRepository.recentComments(
            CANCELLATION_COMMENTS_LIMIT
          ),
      },
      {
        key: 'emoji_feedback_ratings',
        fetch: () =>
          this.emojiFeedbackRepository.countByRating(
            new Date(
              now.getTime() -
                EMOJI_FEEDBACK_LOOKBACK_DAYS * SECONDS_PER_DAY * 1000
            )
          ),
      },
      {
        key: 'emoji_feedback_comments',
        fetch: () =>
          this.emojiFeedbackRepository.recentComments(
            EMOJI_FEEDBACK_COMMENTS_LIMIT
          ),
      },
    ];

    const usedEntries: BusinessMetricsCacheEntry[] = [];
    const freshEntries: BusinessMetricsCacheEntry[] = [];

    const settled = await Promise.all(
      tasks.map(({ key, fetch }) =>
        this.resolveMetric(key, fetch, now, cachedByKey, usedEntries, freshEntries).catch(
          (error: unknown) => {
            const message =
              error instanceof Error ? error.message : String(error);
            errors.push({ metric: key, message });
            return null;
          }
        )
      )
    );

    if (freshEntries.length > 0) {
      try {
        await this.cacheRepository.upsertMany(freshEntries);
      } catch (error) {
        console.error('[ops] business metrics cache upsert failed', error);
      }
    }

    const valueByKey = new Map<BusinessMetricKey, unknown>();
    tasks.forEach(({ key }, idx) => {
      valueByKey.set(key, settled[idx]);
    });

    const cacheAgeSeconds = computeCacheAgeSeconds(usedEntries, now);

    const response: BusinessMetricsResponse = {
      mrr_usd: valueByKey.get('mrr_usd') as number | null,
      net_new_mrr_mtd_usd: valueByKey.get('net_new_mrr_mtd_usd') as number | null,
      active_paying_subs: valueByKey.get('active_paying_subs') as number | null,
      churn_30d_pct: valueByKey.get('churn_30d_pct') as number | null,
      failed_payments_7d: valueByKey.get('failed_payments_7d') as number | null,
      new_paid_conversions_7d: valueByKey.get('new_paid_conversions_7d') as
        | number
        | null,
      mrr_timeseries: valueByKey.get('mrr_timeseries') as
        | MrrTimeseriesPoint[]
        | null,
      active_subs_timeseries: valueByKey.get('active_subs_timeseries') as
        | ActiveSubsTimeseriesPoint[]
        | null,
      conversions_vs_churn_weekly: valueByKey.get('conversions_vs_churn_weekly') as
        | ConversionsChurnWeekPoint[]
        | null,
      failed_payments_weekly: valueByKey.get('failed_payments_weekly') as
        | FailedPaymentsWeekPoint[]
        | null,
      cancellation_reasons_top: valueByKey.get('cancellation_reasons_top') as
        | CancellationReasonCount[]
        | null,
      cancellation_comments_recent: valueByKey.get(
        'cancellation_comments_recent'
      ) as CancellationCommentEntry[] | null,
      as_of: now.toISOString(),
      cache_age_seconds: cacheAgeSeconds,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return response;
  }

  private async loadCacheMap(): Promise<
    Map<BusinessMetricKey, BusinessMetricsCacheEntry>
  > {
    const map = new Map<BusinessMetricKey, BusinessMetricsCacheEntry>();
    try {
      const rows = await this.cacheRepository.loadAll();
      for (const row of rows) {
        map.set(row.key, row);
      }
    } catch (error) {
      console.error('[ops] business metrics cache load failed', error);
    }
    return map;
  }

  private async resolveMetric(
    key: BusinessMetricKey,
    fetcher: () => Promise<unknown>,
    now: Date,
    cachedByKey: Map<BusinessMetricKey, BusinessMetricsCacheEntry>,
    usedEntries: BusinessMetricsCacheEntry[],
    freshEntries: BusinessMetricsCacheEntry[]
  ): Promise<unknown> {
    const existing = cachedByKey.get(key);
    if (existing != null && existing.expiresAt.getTime() > now.getTime()) {
      usedEntries.push(existing);
      return existing.value;
    }
    const value = await fetcher();
    const entry: BusinessMetricsCacheEntry = {
      key,
      value,
      cachedAt: now,
      expiresAt: new Date(now.getTime() + this.cacheTtlMs),
    };
    usedEntries.push(entry);
    freshEntries.push(entry);
    return value;
  }

  private loadAllSubs(): Promise<NormalizedSubscription[]> {
    if (this.allSubsPromise == null) {
      this.allSubsPromise = this.fetchAllSubs();
    }
    return this.allSubsPromise;
  }

  private async fetchAllSubs(): Promise<NormalizedSubscription[]> {
    const stripe = this.stripeFactory();
    const result: NormalizedSubscription[] = [];
    let startingAfter: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const page: StripeTypes.ApiList<StripeTypes.Subscription> =
        await stripe.subscriptions.list({
          status: 'all',
          limit: STRIPE_PAGE_LIMIT,
          starting_after: startingAfter,
        });
      for (const sub of page.data) {
        result.push(normalizeSubscription(sub));
      }
      hasMore = page.has_more === true && page.data.length > 0;
      startingAfter = hasMore ? page.data[page.data.length - 1].id : undefined;
    }
    return result;
  }

  private loadInvoices(now: Date): Promise<NormalizedInvoice[]> {
    if (this.invoicesPromise == null) {
      this.invoicesPromise = this.fetchInvoices(now);
    }
    return this.invoicesPromise;
  }

  private async fetchInvoices(now: Date): Promise<NormalizedInvoice[]> {
    const stripe = this.stripeFactory();
    const since = epochSecondsDaysAgo(now, FAILED_INVOICES_LOOKBACK_DAYS);
    const result: NormalizedInvoice[] = [];
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
        result.push(normalizeInvoice(invoice));
      }
      hasMore = page.has_more === true && page.data.length > 0;
      startingAfter = hasMore ? page.data[page.data.length - 1].id : undefined;
    }
    return result;
  }
}

const computeCacheAgeSeconds = (
  entries: BusinessMetricsCacheEntry[],
  now: Date
): number => {
  if (entries.length === 0) return 0;
  let oldest = now.getTime();
  for (const entry of entries) {
    const t = entry.cachedAt.getTime();
    if (t < oldest) oldest = t;
  }
  return Math.max(0, Math.floor((now.getTime() - oldest) / 1000));
};

const normalizeSubscription = (
  sub: StripeTypes.Subscription
): NormalizedSubscription => {
  const canceledAt = sub.canceled_at ?? null;
  const endedAt = sub.ended_at ?? null;
  const effectiveEnd = endedAt ?? canceledAt;
  return {
    id: sub.id,
    status: sub.status,
    createdMs: sub.created * 1000,
    endedAtMs: effectiveEnd != null ? effectiveEnd * 1000 : null,
    monthlyCents: monthlyCentsForSubscription(sub),
  };
};

const normalizeInvoice = (
  invoice: StripeTypes.Invoice
): NormalizedInvoice => ({
  id: invoice.id ?? '',
  status: invoice.status ?? '',
  attemptCount: invoice.attempt_count ?? 0,
  createdMs: invoice.created != null ? invoice.created * 1000 : 0,
});

const isPayingHistorical = (status: string): boolean => status !== 'trialing';

const isActiveNow = (status: string): boolean =>
  status === 'active' || status === 'past_due' || status === 'unpaid';

const isActiveToday = (sub: NormalizedSubscription, nowMs: number): boolean => {
  if (sub.createdMs > nowMs) return false;
  if (sub.endedAtMs != null && sub.endedAtMs <= nowMs) return false;
  return isActiveNow(sub.status);
};

const wasActiveOn = (
  sub: NormalizedSubscription,
  atMs: number
): boolean => {
  if (sub.createdMs > atMs) return false;
  if (sub.endedAtMs != null && sub.endedAtMs <= atMs) return false;
  return isPayingHistorical(sub.status);
};

const computeMrrUsd = (subs: NormalizedSubscription[], now: Date): number => {
  let cents = 0;
  for (const sub of subs) {
    if (isActiveToday(sub, now.getTime())) {
      cents += sub.monthlyCents;
    }
  }
  return cents / 100;
};

const computeActiveCount = (
  subs: NormalizedSubscription[],
  now: Date
): number => {
  let count = 0;
  for (const sub of subs) {
    if (isActiveToday(sub, now.getTime())) {
      count += 1;
    }
  }
  return count;
};

const computeNetNewMrrMtdUsd = (
  subs: NormalizedSubscription[],
  now: Date
): number => {
  const startMs = startOfMonthUtcMs(now);
  let cents = 0;
  for (const sub of subs) {
    if (sub.createdMs >= startMs && isPayingHistorical(sub.status)) {
      cents += sub.monthlyCents;
    }
  }
  return cents / 100;
};

const computeNewPaidConversions7d = (
  subs: NormalizedSubscription[],
  now: Date
): number => {
  const sinceMs = now.getTime() - 7 * SECONDS_PER_DAY * 1000;
  let count = 0;
  for (const sub of subs) {
    if (sub.createdMs >= sinceMs && isPayingHistorical(sub.status)) {
      count += 1;
    }
  }
  return count;
};

const computeChurn30dPct = (
  subs: NormalizedSubscription[],
  now: Date
): number => {
  const sinceMs = now.getTime() - 30 * SECONDS_PER_DAY * 1000;
  let canceled = 0;
  let active = 0;
  for (const sub of subs) {
    if (sub.endedAtMs != null && sub.endedAtMs >= sinceMs) {
      canceled += 1;
    }
    if (isActiveToday(sub, now.getTime())) {
      active += 1;
    }
  }
  if (active === 0) return 0;
  return (canceled / active) * 100;
};

const computeFailedPayments7d = (
  invoices: NormalizedInvoice[],
  now: Date
): number => {
  const sinceMs = now.getTime() - 7 * SECONDS_PER_DAY * 1000;
  let count = 0;
  for (const invoice of invoices) {
    if (
      invoice.createdMs >= sinceMs &&
      invoice.status === 'open' &&
      invoice.attemptCount > 0
    ) {
      count += 1;
    }
  }
  return count;
};

const computeMrrTimeseries = (
  subs: NormalizedSubscription[],
  now: Date
): MrrTimeseriesPoint[] => {
  const days = lastNDayBucketsUtc(now, MRR_HISTORY_DAYS);
  return days.map((dayMs) => {
    let cents = 0;
    for (const sub of subs) {
      if (wasActiveOn(sub, dayMs)) {
        cents += sub.monthlyCents;
      }
    }
    return { t: isoDate(dayMs), mrr_usd: cents / 100 };
  });
};

const computeActiveSubsTimeseries = (
  subs: NormalizedSubscription[],
  now: Date
): ActiveSubsTimeseriesPoint[] => {
  const days = lastNDayBucketsUtc(now, MRR_HISTORY_DAYS);
  return days.map((dayMs) => {
    let count = 0;
    for (const sub of subs) {
      if (wasActiveOn(sub, dayMs)) {
        count += 1;
      }
    }
    return { t: isoDate(dayMs), active_paying_subs: count };
  });
};

const computeConversionsChurnWeekly = (
  subs: NormalizedSubscription[],
  now: Date
): ConversionsChurnWeekPoint[] => {
  const weekStarts = lastNIsoWeekStartsUtc(now, WEEKLY_HISTORY_WEEKS);
  const weekIndex = new Map<number, ConversionsChurnWeekPoint>();
  for (const startMs of weekStarts) {
    weekIndex.set(startMs, {
      week: isoDate(startMs),
      new_paying: 0,
      churned: 0,
    });
  }
  const earliestStart = weekStarts[0];
  const lastStart = weekStarts[weekStarts.length - 1];
  const weekEnd = lastStart + 7 * SECONDS_PER_DAY * 1000;

  for (const sub of subs) {
    if (
      sub.createdMs >= earliestStart &&
      sub.createdMs < weekEnd &&
      isPayingHistorical(sub.status)
    ) {
      const bucket = isoWeekStartUtcMs(sub.createdMs);
      const row = weekIndex.get(bucket);
      if (row != null) row.new_paying += 1;
    }
    if (
      sub.endedAtMs != null &&
      sub.endedAtMs >= earliestStart &&
      sub.endedAtMs < weekEnd
    ) {
      const bucket = isoWeekStartUtcMs(sub.endedAtMs);
      const row = weekIndex.get(bucket);
      if (row != null) row.churned += 1;
    }
  }

  return weekStarts.map((startMs) => weekIndex.get(startMs) as ConversionsChurnWeekPoint);
};

const computeFailedPaymentsWeekly = (
  invoices: NormalizedInvoice[],
  now: Date
): FailedPaymentsWeekPoint[] => {
  const weekStarts = lastNIsoWeekStartsUtc(now, WEEKLY_HISTORY_WEEKS);
  const weekIndex = new Map<number, FailedPaymentsWeekPoint>();
  for (const startMs of weekStarts) {
    weekIndex.set(startMs, { week: isoDate(startMs), count: 0 });
  }
  const earliestStart = weekStarts[0];
  const lastStart = weekStarts[weekStarts.length - 1];
  const weekEnd = lastStart + 7 * SECONDS_PER_DAY * 1000;

  for (const invoice of invoices) {
    if (
      invoice.status === 'open' &&
      invoice.attemptCount > 0 &&
      invoice.createdMs >= earliestStart &&
      invoice.createdMs < weekEnd
    ) {
      const bucket = isoWeekStartUtcMs(invoice.createdMs);
      const row = weekIndex.get(bucket);
      if (row != null) row.count += 1;
    }
  }

  return weekStarts.map((startMs) => weekIndex.get(startMs) as FailedPaymentsWeekPoint);
};

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

const startOfMonthUtcMs = (now: Date): number =>
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0);

const epochSecondsDaysAgo = (now: Date, days: number): number =>
  Math.floor(now.getTime() / 1000) - days * SECONDS_PER_DAY;

const startOfDayUtcMs = (atMs: number): number => {
  const d = new Date(atMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
};

const lastNDayBucketsUtc = (now: Date, n: number): number[] => {
  const todayStart = startOfDayUtcMs(now.getTime());
  const result: number[] = [];
  for (let offset = n - 1; offset >= 0; offset -= 1) {
    result.push(todayStart - offset * SECONDS_PER_DAY * 1000);
  }
  return result;
};

const isoDate = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

const isoWeekStartUtcMs = (atMs: number): number => {
  const dayStart = startOfDayUtcMs(atMs);
  const dow = new Date(dayStart).getUTCDay();
  const daysSinceMonday = (dow + 6) % 7;
  return dayStart - daysSinceMonday * SECONDS_PER_DAY * 1000;
};

const lastNIsoWeekStartsUtc = (now: Date, n: number): number[] => {
  const currentWeekStart = isoWeekStartUtcMs(now.getTime());
  const result: number[] = [];
  for (let offset = n - 1; offset >= 0; offset -= 1) {
    result.push(currentWeekStart - offset * 7 * SECONDS_PER_DAY * 1000);
  }
  return result;
};

export default BusinessMetricsService;
