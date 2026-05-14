const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

interface PurchaseParams {
  transactionId: string;
  valueCents: number;
  currency: string;
  stripeCustomerId: string;
  clientId?: string;
}

export async function sendPurchaseEvent(params: PurchaseParams): Promise<void> {
  const apiSecret = process.env.GA4_API_SECRET;
  const measurementId = process.env.GA4_MEASUREMENT_ID;

  if (!apiSecret || !measurementId) {
    return;
  }

  const clientId = params.clientId ?? params.stripeCustomerId;
  const url = `${GA4_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: params.transactionId,
            value: params.valueCents / 100,
            currency: params.currency.toUpperCase(),
            items: [],
          },
        },
      ],
    }),
  });

  console.info(`[ga4] purchase sent ${params.transactionId}`);
}
