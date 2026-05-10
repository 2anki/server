const SIGNUP_ORIGIN_PATTERN = /^\/[a-z0-9-]{1,64}$/;

export function parseSignupOrigin(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  if (!SIGNUP_ORIGIN_PATTERN.test(raw)) {
    return null;
  }
  return raw;
}
