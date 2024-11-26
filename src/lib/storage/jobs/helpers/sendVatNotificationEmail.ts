import { useDefaultEmailService } from '../../../../services/EmailService/EmailService';
import { getStripe } from '../../../integrations/stripe';
import Stripe from 'stripe';

const stripe = getStripe();

const sendVatNotificationEmail = async () => {
  const emailService = useDefaultEmailService();
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
      if (typeof subscription.customer === 'string') {
        const customer = await stripe.customers.retrieve(subscription.customer);

        if ('email' in customer) {
          console.log({
            email: customer.email,
            currency: subscription.currency,
          });
          await emailService.sendVatNotificationEmail(
            customer.email ?? `alexander+${subscription.id}@alemayhu.com`, // fallback to inform dev if email is not set
            subscription.currency,
            customer.name ?? 'there'
          );
        } else {
          console.warn('Customer does not have an email');
        }
      }
    }

    hasMore = subscriptions.has_more;
    if (hasMore) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
    }
  }
};

if (require.main === module) {
  sendVatNotificationEmail().catch(console.error);
}
