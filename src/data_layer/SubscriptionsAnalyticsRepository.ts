import type { Knex } from 'knex';

export interface ISubscriptionsAnalyticsRepository {
  mrrUsd(now: Date): Promise<number>;
  activePayingSubs(): Promise<number>;
  netNewMrrMtdUsd(now: Date): Promise<number>;
  newPaidConversions7d(now: Date): Promise<number>;
  churn30dPct(now: Date): Promise<number>;
}

const MRR_SQL = `
  -- mrr
  SELECT COALESCE(SUM(
    (item->'price'->>'unit_amount')::numeric
    * COALESCE((item->>'quantity')::numeric, 1)
    / CASE
        WHEN item->'price'->'recurring'->>'interval' = 'year'  THEN 12 * COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1)
        WHEN item->'price'->'recurring'->>'interval' = 'month' THEN COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1)
        WHEN item->'price'->'recurring'->>'interval' = 'week'  THEN COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1) / 4.333333
        WHEN item->'price'->'recurring'->>'interval' = 'day'   THEN COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1) / 30.0
        ELSE NULL
      END
  ), 0)::float / 100.0 AS mrr_usd
  FROM subscriptions s
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(s.payload->'items'->'data', '[]'::jsonb)) AS item
  WHERE s.active = true
    AND item->'price'->'recurring'->>'interval' IS NOT NULL
    AND item->'price'->>'unit_amount' IS NOT NULL
`;

const ACTIVE_PAYING_SUBS_SQL = `
  -- active_paying_subs
  SELECT COUNT(*)::int AS count
  FROM subscriptions
  WHERE active = true
`;

const NET_NEW_MRR_MTD_SQL = `
  -- net_new_mrr_mtd
  SELECT COALESCE(SUM(
    (item->'price'->>'unit_amount')::numeric
    * COALESCE((item->>'quantity')::numeric, 1)
    / CASE
        WHEN item->'price'->'recurring'->>'interval' = 'year'  THEN 12 * COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1)
        WHEN item->'price'->'recurring'->>'interval' = 'month' THEN COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1)
        WHEN item->'price'->'recurring'->>'interval' = 'week'  THEN COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1) / 4.333333
        WHEN item->'price'->'recurring'->>'interval' = 'day'   THEN COALESCE((item->'price'->'recurring'->>'interval_count')::numeric, 1) / 30.0
        ELSE NULL
      END
  ), 0)::float / 100.0 AS net_new_mrr_mtd_usd
  FROM subscriptions s
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(s.payload->'items'->'data', '[]'::jsonb)) AS item
  WHERE s.active = true
    AND s.created_at >= date_trunc('month', ?::timestamptz)
    AND item->'price'->'recurring'->>'interval' IS NOT NULL
    AND item->'price'->>'unit_amount' IS NOT NULL
`;

const NEW_PAID_CONVERSIONS_7D_SQL = `
  -- new_paid_conversions_7d
  SELECT COUNT(*)::int AS count
  FROM subscriptions
  WHERE created_at >= ?::timestamptz - interval '7 days'
`;

const CHURN_30D_SQL = `
  -- churn_30d
  WITH params AS (
    SELECT
      EXTRACT(EPOCH FROM (?::timestamptz - interval '30 days'))::bigint AS cutoff_epoch,
      ?::timestamptz - interval '30 days' AS cutoff_ts
  ),
  denom AS (
    SELECT COUNT(*)::float AS n
    FROM subscriptions s, params p
    WHERE s.created_at < p.cutoff_ts
      AND (
        (s.payload->>'canceled_at') IS NULL
        OR (s.payload->>'canceled_at')::bigint > p.cutoff_epoch
      )
  ),
  numer AS (
    SELECT COUNT(*)::float AS n
    FROM subscriptions s, params p
    WHERE (s.payload->>'canceled_at') IS NOT NULL
      AND (s.payload->>'canceled_at')::bigint >= p.cutoff_epoch
  )
  SELECT CASE
    WHEN (SELECT n FROM denom) = 0 THEN 0
    ELSE (SELECT n FROM numer) / (SELECT n FROM denom) * 100.0
  END::float AS churn_30d_pct
`;

export class SubscriptionsAnalyticsRepository
  implements ISubscriptionsAnalyticsRepository
{
  constructor(private readonly database: Knex) {}

  async mrrUsd(_now: Date): Promise<number> {
    const result = await this.database.raw(MRR_SQL, []);
    const row = (result.rows ?? [])[0] ?? { mrr_usd: 0 };
    return Number(row.mrr_usd ?? 0);
  }

  async activePayingSubs(): Promise<number> {
    const result = await this.database.raw(ACTIVE_PAYING_SUBS_SQL, []);
    const row = (result.rows ?? [])[0] ?? { count: 0 };
    return Number(row.count ?? 0);
  }

  async netNewMrrMtdUsd(now: Date): Promise<number> {
    const result = await this.database.raw(NET_NEW_MRR_MTD_SQL, [now]);
    const row = (result.rows ?? [])[0] ?? { net_new_mrr_mtd_usd: 0 };
    return Number(row.net_new_mrr_mtd_usd ?? 0);
  }

  async newPaidConversions7d(now: Date): Promise<number> {
    const result = await this.database.raw(NEW_PAID_CONVERSIONS_7D_SQL, [now]);
    const row = (result.rows ?? [])[0] ?? { count: 0 };
    return Number(row.count ?? 0);
  }

  async churn30dPct(now: Date): Promise<number> {
    const result = await this.database.raw(CHURN_30D_SQL, [now, now]);
    const row = (result.rows ?? [])[0] ?? { churn_30d_pct: 0 };
    return Number(row.churn_30d_pct ?? 0);
  }
}

export default SubscriptionsAnalyticsRepository;
