import Stripe from 'stripe';
import { getDatabase } from '../data_layer';
import { getStripe } from '../lib/integrations/stripe';
import { getDefaultEmailService } from './EmailService/EmailService';
import Subscriptions from '../data_layer/public/Subscriptions';

export type CancelMode = 'immediate' | 'period_end';

async function collectCandidateEmails(userEmail: string): Promise<string[]> {
  const normalized = userEmail.toLowerCase();
  const db = getDatabase();
  const linked: Array<{ email: string }> = await db('subscriptions')
    .select('email')
    .where({ linked_email: normalized });

  const emails = new Set<string>([normalized]);
  for (const row of linked) {
    if (row.email) {
      emails.add(row.email.toLowerCase());
    }
  }
  return [...emails];
}

async function listStripeSubscriptionsFor(
  userEmail: string,
  status: Stripe.SubscriptionListParams['status']
): Promise<Stripe.Subscription[]> {
  const stripe = getStripe();
  const candidateEmails = await collectCandidateEmails(userEmail);

  const seen = new Set<string>();
  const subs: Stripe.Subscription[] = [];

  for (const email of candidateEmails) {
    const customers = await stripe.customers.list({ email, limit: 10 });
    for (const customer of customers.data) {
      const list = await stripe.subscriptions.list({
        customer: customer.id,
        status,
        limit: 10,
      });
      for (const sub of list.data) {
        if (!seen.has(sub.id)) {
          seen.add(sub.id);
          subs.push(sub);
        }
      }
    }
  }

  return subs;
}

export class SubscriptionService {
  static findActiveStripeSubscriptions(
    userEmail: string
  ): Promise<Stripe.Subscription[]> {
    return listStripeSubscriptionsFor(userEmail, 'active');
  }

  static findRecentStripeSubscriptions(
    userEmail: string
  ): Promise<Stripe.Subscription[]> {
    return listStripeSubscriptionsFor(userEmail, 'all');
  }

  static async cancelUserSubscriptions(
    userEmail: string,
    mode: CancelMode = 'period_end'
  ): Promise<number> {
    const stripe = getStripe();
    const emailService = getDefaultEmailService();
    const subs = await this.findActiveStripeSubscriptions(userEmail);

    console.log(
      `Found ${subs.length} active Stripe subscriptions for ${userEmail}`
    );

    for (const sub of subs) {
      if (mode === 'immediate') {
        console.log(`Cancelling Stripe subscription ${sub.id} immediately`);
        await stripe.subscriptions.cancel(sub.id);
        await emailService.sendSubscriptionCancelledEmail(userEmail, '', sub.id);
      } else {
        console.log(
          `Scheduling cancellation at period end for Stripe subscription ${sub.id}`
        );
        const updated = await stripe.subscriptions.update(sub.id, {
          cancel_at_period_end: true,
        });
        const periodEndSeconds =
          updated.current_period_end ?? sub.current_period_end;
        if (periodEndSeconds) {
          await emailService.sendSubscriptionScheduledCancellationEmail(
            userEmail,
            '',
            new Date(periodEndSeconds * 1000)
          );
        }
      }
    }

    if (mode === 'immediate' && subs.length > 0) {
      const normalized = userEmail.toLowerCase();
      const db = getDatabase();
      await db('subscriptions')
        .where(function () {
          this.where({ email: normalized }).orWhere({
            linked_email: normalized,
          });
        })
        .update({ active: false });
    }

    return subs.length;
  }

  static async getUserActiveSubscriptions(
    userEmail: string
  ): Promise<Subscriptions[]> {
    const database = getDatabase();

    return database('subscriptions')
      .where(function () {
        this.where({ email: userEmail.toLowerCase() }).orWhere({
          linked_email: userEmail.toLowerCase(),
        });
      })
      .andWhere({ active: true });
  }

  async deactivateSubscription(subscriptionId: number): Promise<void> {
    const database = getDatabase();

    await database('subscriptions')
      .where({ id: subscriptionId })
      .update({ active: false });
  }
}

export default SubscriptionService;
