import Stripe from 'stripe';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';
import { Knex } from 'knex';

const stripe = new Stripe(process.env.STRIPE_KEY!);

export const getStripe = () => stripe;

export const getCustomerId = (
  customer: string | StripeTypes.Customer | StripeTypes.DeletedCustomer | null
) => {
  if (typeof customer === 'string') {
    return customer;
  }
  return customer?.id;
};

export const updateStoreSubscription = async (
  db: Knex,
  customer: StripeTypes.Customer,
  subscription: StripeTypes.Subscription
) => {
  const email = customer.email;
  const isActive = subscription.status === 'active';
  const isCancelScheduled = subscription.cancel_at_period_end === true;

  let shouldRemainActive = isActive;
  if (isActive && isCancelScheduled) {
    const periodEndDate = new Date((subscription.cancel_at ?? 0) * 1000);
    const currentDate = new Date();
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
