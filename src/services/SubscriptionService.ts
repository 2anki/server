import { getDatabase } from '../data_layer';
import { getStripe } from '../lib/integrations/stripe';
import Subscriptions from '../data_layer/public/Subscriptions';

export class SubscriptionService {
  static async cancelUserSubscriptions(userEmail: string): Promise<void> {
    try {
      const database = getDatabase();
      const stripe = getStripe();

      // Find active subscriptions for this user (both direct and linked email)
      const subscriptions: Subscriptions[] = await database('subscriptions')
        .where(function() {
          this.where({ email: userEmail.toLowerCase() })
              .orWhere({ linked_email: userEmail.toLowerCase() });
        })
        .andWhere({ active: true });

      console.log(`Found ${subscriptions.length} active subscriptions for user ${userEmail}`);

      // Cancel each subscription in Stripe
      for (const subscription of subscriptions) {
        try {
          let stripeSubscription: any = null;
          
          // Handle different payload types
          if (typeof subscription.payload === 'object' && subscription.payload !== null) {
            // Payload is already an object
            stripeSubscription = subscription.payload;
          } else if (typeof subscription.payload === 'string') {
            // Payload is a JSON string that needs parsing
            try {
              stripeSubscription = JSON.parse(subscription.payload);
            } catch (parseError) {
              console.error(`Failed to parse subscription payload for ID ${subscription.id}:`, parseError);
              continue;
            }
          } else {
            console.error(`Invalid payload type for subscription ${subscription.id}:`, typeof subscription.payload);
            continue;
          }
          
          if (stripeSubscription?.id) {
            console.log(`Cancelling Stripe subscription ${stripeSubscription.id}`);
            await stripe.subscriptions.cancel(stripeSubscription.id);
            
            // Update local database to mark as inactive
            await database('subscriptions')
              .where({ id: subscription.id })
              .update({ active: false });
              
            console.log(`Successfully cancelled subscription ${stripeSubscription.id}`);
          } else {
            console.error(`No Stripe subscription ID found in payload for subscription ${subscription.id}`);
          }
        } catch (subscriptionError) {
          console.error(`Failed to cancel subscription ${subscription.id}:`, subscriptionError);
          // Continue with other subscriptions even if one fails
        }
      }
    } catch (error) {
      console.error('Error cancelling user subscriptions:', error);
      // Don't throw here - we still want to allow account deletion even if subscription cancellation fails
    }
  }

  static async getUserActiveSubscriptions(userEmail: string): Promise<Subscriptions[]> {
    const database = getDatabase();
    
    return database('subscriptions')
      .where(function() {
        this.where({ email: userEmail.toLowerCase() })
            .orWhere({ linked_email: userEmail.toLowerCase() });
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