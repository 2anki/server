import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';
import type { PassKind } from '../../data_layer/UserPassRepository';

export interface CreatePassCheckoutResult {
  url: string;
}

export class CreatePassCheckoutUseCase {
  constructor(
    private readonly stripe: Pick<StripeTypes, 'checkout'>,
    private readonly priceId: string,
    private readonly passKind: PassKind
  ) {}

  async execute(input: {
    userEmail: string;
    userId: number;
    stripeCustomerId?: string | null;
  }): Promise<CreatePassCheckoutResult> {
    const appUrl = process.env.APP_URL ?? 'https://2anki.net';

    const sessionParams: StripeTypes.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: [{ price: this.priceId, quantity: 1 }],
      success_url: `${appUrl}/upload?from=pass`,
      cancel_url: `${appUrl}/pricing`,
      customer_email: input.stripeCustomerId == null ? input.userEmail : undefined,
      customer: input.stripeCustomerId ?? undefined,
      metadata: {
        user_id: String(input.userId),
        pass_kind: this.passKind,
      },
    };

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return { url: session.url! };
  }
}
