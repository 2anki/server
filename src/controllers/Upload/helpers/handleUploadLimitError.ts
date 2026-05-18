import express from 'express';
import { getDefaultEmailService } from '../../../services/EmailService/EmailService';
import UsersService from '../../../services/UsersService';
import UsersRepository from '../../../data_layer/UsersRepository';
import { getDatabase } from '../../../data_layer';
import SubscriptionService from '../../../services/SubscriptionService';
import { getStripe, updateStoreSubscription } from '../../../lib/integrations/stripe';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';

export const handleUploadLimitError = async (
  req: express.Request,
  response: express.Response
) => {
  const owner = response.locals.owner;

  if (owner) {
    const database = getDatabase();
    const emailService = getDefaultEmailService();
    const usersService = new UsersService(
      new UsersRepository(database),
      emailService
    );

    const user = await usersService.getUserById(response.locals.owner);
    if (user) {
      try {
        const activeSubs = await SubscriptionService.findActiveStripeSubscriptions(user.email);
        if (activeSubs.length > 0) {
          const stripe = getStripe();
          for (const sub of activeSubs) {
            const customer = await stripe.customers.retrieve(
              sub.customer as string
            ) as StripeTypes.Customer;
            await updateStoreSubscription(database, customer, sub);
          }
          return response.redirect('/upload');
        }
      } catch (err) {
        console.error('[handleUploadLimitError] Stripe sync failed:', err);
      }
      return response.redirect('/limit');
    }
  }

  response.redirect('/limit');
};
