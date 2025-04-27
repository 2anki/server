import Stripe from 'stripe';
import { Knex } from 'knex';

const stripe = new Stripe(process.env.STRIPE_KEY!);

export const getStripe = () => stripe;

export const getCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) => {
  if (typeof customer === 'string') {
    return customer;
  }
  return customer?.id;
};

export const updateStoreSubscription = async (
  db: Knex,
  customer: Stripe.Customer,
  subscription: Stripe.Subscription
) => {
  const email = customer.email;
  // A subscription should be considered active if:
  // 1. Its status is 'active' AND
  // 2. Either it's not scheduled for cancellation OR it is scheduled but hasn't reached the end date yet
  const isActive = subscription.status === 'active';
  const isCancelScheduled = subscription.cancel_at_period_end === true;

  // If cancellation is scheduled, we need to check if we're still within the paid period
  let shouldRemainActive = isActive;
  if (isActive && isCancelScheduled) {
    // current_period_end is in seconds since epoch, so convert to milliseconds for Date
    const periodEndDate = new Date(subscription.current_period_end * 1000);
    const currentDate = new Date();
    // Keep active if current date is before the period end date
    shouldRemainActive = currentDate < periodEndDate;
  }

  await db('subscriptions')
    .insert({
      email: email?.toLowerCase(),
      active: shouldRemainActive,
      payload: JSON.stringify(subscription),
    })
    .onConflict('email')
    .merge();
};
