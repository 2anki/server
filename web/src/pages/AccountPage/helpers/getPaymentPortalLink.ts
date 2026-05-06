export const getPaymentPortalLink = () => process.env.NODE_ENV === 'development'
  ? 'https://billing.stripe.com/p/login/test_00g6pu0q60JYbMQ3cc'
  : 'https://billing.stripe.com/p/login/aEUaHp8ma4VPfPW9AA'
  