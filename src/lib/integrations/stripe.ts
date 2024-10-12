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
  const active = subscription.status === 'active';
  await db('subscriptions')
    .insert({
      email: email?.toLowerCase(),
      active: active,
      payload: JSON.stringify(subscription),
    })
    .onConflict('email')
    .merge();
};
