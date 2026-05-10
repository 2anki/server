export const SIGNUP_ORIGIN_KEY = 'signup_origin';

const SIGNUP_ORIGIN_PATTERN = /^\/[a-z0-9-]{1,64}$/;

function sanitize(value: string | null): string | null {
  if (value == null) {
    return null;
  }
  if (!SIGNUP_ORIGIN_PATTERN.test(value)) {
    return null;
  }
  return value;
}

export function readSignupOrigin(
  search: string,
  storage: Pick<Storage, 'getItem'> | null
): string | null {
  const params = new URLSearchParams(search);
  const fromQuery = sanitize(params.get('source'));
  if (fromQuery != null) {
    return fromQuery;
  }
  if (storage == null) {
    return null;
  }
  return sanitize(storage.getItem(SIGNUP_ORIGIN_KEY));
}

export function persistSignupOrigin(
  pathname: string,
  storage: Pick<Storage, 'setItem'> | null
): void {
  if (storage == null) {
    return;
  }
  if (!SIGNUP_ORIGIN_PATTERN.test(pathname)) {
    return;
  }
  storage.setItem(SIGNUP_ORIGIN_KEY, pathname);
}
