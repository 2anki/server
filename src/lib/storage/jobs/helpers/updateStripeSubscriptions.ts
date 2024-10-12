import { getStripe } from '../../../integrations/stripe';
import { getDatabase } from '../../../../data_layer';
import Stripe from 'stripe';

const stripe = getStripe();
const database = getDatabase();

const updateCustomer = async (customer: Stripe.Customer) => {
  const sub = await database
    .table('subscriptions')
    .where({ email: customer.email })
    .first();

  if (sub && !sub.active) {
    console.info('Updating customer', customer.id);
    await database
      .table('customers')
      .where({ email: customer.email })
      .update({ active: true });
  } else {
    console.info('Customer already active', customer.id);
  }
};

const processSubscription = async (subscription: Stripe.Subscription) => {
  if (typeof subscription.customer === 'string') {
    const customer = await stripe.customers.retrieve(subscription.customer);
    if ('email' in customer) {
      await updateCustomer(customer);
    } else {
      console.warn('Customer does not have an email');
    }
  }
};

const updateStripeSubscriptions = async () => {
  let hasMore = true;
  let startingAfter: string | undefined = undefined;

  while (hasMore) {
    const subscriptions: Stripe.ApiList<Stripe.Subscription> =
      await stripe.subscriptions.list({
        limit: 100,
        status: 'active',
        starting_after: startingAfter,
      });

    for (const subscription of subscriptions.data) {
      await processSubscription(subscription);
    }

    hasMore = subscriptions.has_more;
    if (hasMore) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
    }
  }
};

if (require.main === module) {
  updateStripeSubscriptions().catch(console.error);
}
