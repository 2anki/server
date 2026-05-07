import crypto from 'crypto';

export const verifyNotionWebhookSignature = (
  rawBody: string,
  signature: string | undefined,
  secret: string
): boolean => {
  if (signature == null || signature.length === 0 || secret.length === 0) {
    return false;
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  const provided = signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature;
  if (expected.length !== provided.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(provided, 'hex')
  );
};
