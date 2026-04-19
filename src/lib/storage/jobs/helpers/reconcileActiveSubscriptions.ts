import { Knex } from 'knex';
import Stripe from 'stripe';

interface ActiveSubscriptionRow {
  id: number;
  email: string;
  payload: unknown;
}

function parseSubscriptionId(payload: unknown): string | null {
  if (payload == null) return null;
  if (typeof payload === 'object') {
    const id = (payload as { id?: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload);
      return typeof parsed?.id === 'string' ? parsed.id : null;
    } catch {
      return null;
    }
  }
  return null;
}

function stripeReportsInactive(subscription: Stripe.Subscription): boolean {
  if (subscription.status !== 'active') return true;

  if (subscription.cancel_at_period_end && subscription.current_period_end) {
    const periodEndMs = subscription.current_period_end * 1000;
    return Date.now() >= periodEndMs;
  }
  return false;
}

async function deactivateRow(
  db: Knex,
  row: ActiveSubscriptionRow,
  subscription?: Stripe.Subscription
): Promise<void> {
  const update: { active: boolean; payload?: string } = { active: false };
  if (subscription) {
    update.payload = JSON.stringify(subscription);
  }
  await db('subscriptions').where({ id: row.id }).update(update);
  console.info(
    `[stripe-sync] Flipped subscription row ${row.id} (${row.email}) to inactive`
  );
}

export async function reconcileActiveSubscriptions(
  db: Knex,
  stripe: Pick<Stripe, 'subscriptions'>
): Promise<void> {
  const rows: ActiveSubscriptionRow[] = await db('subscriptions')
    .select('id', 'email', 'payload')
    .where({ active: true });

  console.info(`[stripe-sync] Reconciling ${rows.length} active DB row(s)`);

  for (const row of rows) {
    const subscriptionId = parseSubscriptionId(row.payload);
    if (!subscriptionId) {
      console.warn(
        `[stripe-sync] Row ${row.id} (${row.email}) has no parseable subscription id; skipping`
      );
      continue;
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (stripeReportsInactive(subscription)) {
        await deactivateRow(db, row, subscription);
      }
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 404) {
        await deactivateRow(db, row);
        continue;
      }
      console.error(
        `[stripe-sync] Failed to reconcile row ${row.id} (${row.email}):`,
        error
      );
    }
  }
}
