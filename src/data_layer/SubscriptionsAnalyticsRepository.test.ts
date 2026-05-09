import { SubscriptionsAnalyticsRepository } from './SubscriptionsAnalyticsRepository';

interface FakeSubscriptionRow {
  id: number;
  email: string;
  active: boolean;
  payload: Record<string, unknown>;
  created_at: Date;
}

interface RawCall {
  sql: string;
  bindings: unknown[];
}

const monthlyPrice = (unitAmount: number) => ({
  unit_amount: unitAmount,
  recurring: { interval: 'month', interval_count: 1 },
});

const yearlyPrice = (unitAmount: number) => ({
  unit_amount: unitAmount,
  recurring: { interval: 'year', interval_count: 1 },
});

const weeklyPrice = (unitAmount: number) => ({
  unit_amount: unitAmount,
  recurring: { interval: 'week', interval_count: 1 },
});

const buildPayload = (
  items: { price: ReturnType<typeof monthlyPrice>; quantity?: number }[],
  extras: Record<string, unknown> = {}
) => ({
  items: { data: items.map((item) => ({ price: item.price, quantity: item.quantity ?? 1 })) },
  ...extras,
});

const buildFakeKnex = (rows: FakeSubscriptionRow[]) => {
  const calls: RawCall[] = [];

  const evaluateMrr = () => {
    let total = 0;
    for (const row of rows) {
      if (!row.active) continue;
      const items = ((row.payload as { items?: { data?: { price: { unit_amount: number; recurring: { interval: string; interval_count?: number } }; quantity?: number }[] } }).items?.data) ?? [];
      for (const item of items) {
        const unitAmount = item.price.unit_amount;
        const quantity = item.quantity ?? 1;
        const interval = item.price.recurring.interval;
        const intervalCount = item.price.recurring.interval_count ?? 1;
        let monthly = 0;
        if (interval === 'month') monthly = (unitAmount * quantity) / intervalCount;
        else if (interval === 'year') monthly = (unitAmount * quantity) / (12 * intervalCount);
        else if (interval === 'week') monthly = (unitAmount * quantity * 4.333333) / intervalCount;
        else if (interval === 'day') monthly = (unitAmount * quantity * 30) / intervalCount;
        total += monthly;
      }
    }
    return total / 100;
  };

  const evaluateActive = () => rows.filter((r) => r.active).length;

  const evaluateNetNewMtd = (now: Date) => {
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    let total = 0;
    for (const row of rows) {
      if (!row.active) continue;
      if (row.created_at < monthStart) continue;
      const items = ((row.payload as { items?: { data?: { price: { unit_amount: number; recurring: { interval: string; interval_count?: number } }; quantity?: number }[] } }).items?.data) ?? [];
      for (const item of items) {
        const unitAmount = item.price.unit_amount;
        const quantity = item.quantity ?? 1;
        const interval = item.price.recurring.interval;
        const intervalCount = item.price.recurring.interval_count ?? 1;
        let monthly = 0;
        if (interval === 'month') monthly = (unitAmount * quantity) / intervalCount;
        else if (interval === 'year') monthly = (unitAmount * quantity) / (12 * intervalCount);
        total += monthly;
      }
    }
    return total / 100;
  };

  const evaluateConversions = (now: Date) => {
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return rows.filter((r) => r.created_at >= cutoff).length;
  };

  const evaluateChurn = (now: Date) => {
    const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const cutoffEpoch = Math.floor(cutoff30.getTime() / 1000);
    const denom = rows.filter((r) => {
      if (r.created_at >= cutoff30) return false;
      const canceled = (r.payload as { canceled_at?: number | null }).canceled_at;
      return canceled == null || canceled > cutoffEpoch;
    }).length;
    const numerator = rows.filter((r) => {
      const canceled = (r.payload as { canceled_at?: number | null }).canceled_at;
      return canceled != null && canceled >= cutoffEpoch;
    }).length;
    if (denom === 0) return 0;
    return (numerator / denom) * 100;
  };

  const fn = ((_tableName: string) => {
    throw new Error('SubscriptionsAnalyticsRepository should use raw queries');
  }) as never;
  (fn as unknown as { raw: (sql: string, bindings: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }).raw =
    async (sql: string, bindings: unknown[] = []) => {
      calls.push({ sql, bindings });
      const now = (bindings[0] as Date) ?? new Date();
      if (sql.includes('-- mrr')) {
        return { rows: [{ mrr_usd: evaluateMrr() }] };
      }
      if (sql.includes('-- active_paying_subs')) {
        return { rows: [{ count: evaluateActive() }] };
      }
      if (sql.includes('-- net_new_mrr_mtd')) {
        return { rows: [{ net_new_mrr_mtd_usd: evaluateNetNewMtd(now) }] };
      }
      if (sql.includes('-- new_paid_conversions_7d')) {
        return { rows: [{ count: evaluateConversions(now) }] };
      }
      if (sql.includes('-- churn_30d')) {
        return { rows: [{ churn_30d_pct: evaluateChurn(now) }] };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    };

  return { db: fn, calls };
};

describe('SubscriptionsAnalyticsRepository', () => {
  const FIXED_NOW = new Date('2026-05-09T12:00:00Z');

  const monthlySub = (id: number, unitAmount: number, createdAt: Date, active = true): FakeSubscriptionRow => ({
    id,
    email: `user${id}@example.com`,
    active,
    payload: buildPayload([{ price: monthlyPrice(unitAmount) }]),
    created_at: createdAt,
  });

  it('mrr sums monthly subscriptions and ignores inactive', async () => {
    const rows = [
      monthlySub(1, 500, new Date('2026-01-01')),
      monthlySub(2, 1000, new Date('2026-02-01')),
      monthlySub(3, 9999, new Date('2026-03-01'), false),
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    const result = await repo.mrrUsd(FIXED_NOW);
    expect(result).toBeCloseTo(15, 2);
  });

  it('mrr normalizes yearly intervals to monthly', async () => {
    const rows: FakeSubscriptionRow[] = [
      {
        id: 1,
        email: 'y@example.com',
        active: true,
        payload: buildPayload([{ price: yearlyPrice(12000) }]),
        created_at: new Date('2026-01-01'),
      },
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    const result = await repo.mrrUsd(FIXED_NOW);
    expect(result).toBeCloseTo(10, 2);
  });

  it('mrr normalizes weekly intervals to monthly', async () => {
    const rows: FakeSubscriptionRow[] = [
      {
        id: 1,
        email: 'w@example.com',
        active: true,
        payload: buildPayload([{ price: weeklyPrice(300) }]),
        created_at: new Date('2026-01-01'),
      },
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    const result = await repo.mrrUsd(FIXED_NOW);
    expect(result).toBeCloseTo(13, 0);
  });

  it('mrr accounts for quantity and multi-item subs', async () => {
    const rows: FakeSubscriptionRow[] = [
      {
        id: 1,
        email: 'multi@example.com',
        active: true,
        payload: buildPayload([
          { price: monthlyPrice(500), quantity: 3 },
          { price: monthlyPrice(200), quantity: 1 },
        ]),
        created_at: new Date('2026-01-01'),
      },
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    const result = await repo.mrrUsd(FIXED_NOW);
    expect(result).toBeCloseTo(17, 2);
  });

  it('activePayingSubs counts only active rows (trialing excluded)', async () => {
    const rows = [
      monthlySub(1, 500, new Date('2026-01-01'), true),
      monthlySub(2, 500, new Date('2026-02-01'), true),
      monthlySub(3, 500, new Date('2026-03-01'), false),
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    expect(await repo.activePayingSubs()).toBe(2);
  });

  it('netNewMrrMtd only counts subs created after start of current month', async () => {
    const rows = [
      monthlySub(1, 1000, new Date('2026-04-15')),
      monthlySub(2, 500, new Date('2026-05-01T00:00:00Z')),
      monthlySub(3, 800, new Date('2026-05-08')),
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    const result = await repo.netNewMrrMtdUsd(FIXED_NOW);
    expect(result).toBeCloseTo(13, 2);
  });

  it('newPaidConversions7d counts rows in the last 7 days', async () => {
    const rows = [
      monthlySub(1, 500, new Date('2026-04-20')),
      monthlySub(2, 500, new Date('2026-05-08')),
      monthlySub(3, 500, new Date('2026-05-09T11:00:00Z')),
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    expect(await repo.newPaidConversions7d(FIXED_NOW)).toBe(2);
  });

  it('churn30dPct returns 0 when there is no denominator', async () => {
    const { db } = buildFakeKnex([]);
    const repo = new SubscriptionsAnalyticsRepository(db);
    expect(await repo.churn30dPct(FIXED_NOW)).toBe(0);
  });

  it('churn30dPct counts cancellations in the last 30 days over active 30d ago', async () => {
    const cutoffSeconds = Math.floor(
      (FIXED_NOW.getTime() - 30 * 24 * 60 * 60 * 1000) / 1000
    );
    const recentCancel = cutoffSeconds + 5 * 24 * 60 * 60;
    const oldCancel = cutoffSeconds - 24 * 60 * 60;

    const rows: FakeSubscriptionRow[] = [
      {
        id: 1,
        email: 'a@example.com',
        active: false,
        payload: buildPayload([{ price: monthlyPrice(500) }], { canceled_at: recentCancel }),
        created_at: new Date('2026-01-01'),
      },
      {
        id: 2,
        email: 'b@example.com',
        active: true,
        payload: buildPayload([{ price: monthlyPrice(500) }]),
        created_at: new Date('2026-01-01'),
      },
      {
        id: 3,
        email: 'c@example.com',
        active: true,
        payload: buildPayload([{ price: monthlyPrice(500) }]),
        created_at: new Date('2026-01-01'),
      },
      {
        id: 4,
        email: 'old@example.com',
        active: false,
        payload: buildPayload([{ price: monthlyPrice(500) }], { canceled_at: oldCancel }),
        created_at: new Date('2026-01-01'),
      },
    ];
    const { db } = buildFakeKnex(rows);
    const repo = new SubscriptionsAnalyticsRepository(db);
    const churn = await repo.churn30dPct(FIXED_NOW);
    expect(churn).toBeCloseTo(33.33, 1);
  });
});
