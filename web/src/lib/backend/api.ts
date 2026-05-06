import handleRedirect from '../handleRedirect';
import { NOT_FOUND, UNAUTHORIZED } from './http';

interface ClientSideOptions {
  redirect?: boolean;
}

// Pages reachable without a session. A 401 fired from any of these
// shouldn't bounce the user to /login — the page itself works for
// anons, so a background 401 is fine to swallow.
const NON_AUTH_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot',
  '/users/r/',
  '/upload',
  '/pricing',
  '/about',
  '/contact',
  '/documentation',
  '/debug',
  '/successful-checkout',
];

function isNonAuthPath(pathname: string): boolean {
  return NON_AUTH_PATHS.some((prefix) => {
    if (prefix === '/') return pathname === '/';
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function redirectToLogin() {
  const currentPath = globalThis.location?.pathname ?? '';
  if (isNonAuthPath(currentPath)) return;
  globalThis.location.href = '/login';
}

export const getLoginURL = (baseURL: string) => `${baseURL}users/login`;

export const post = async (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

export const get = async (
  url: string,
  options: ClientSideOptions = { redirect: true }
) => {
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (options.redirect && handleRedirect(response)) {
    return undefined;
  }

  if (!response.ok) {
    if (response.status === UNAUTHORIZED) {
      redirectToLogin();
      return undefined;
    }
    if (response.status === NOT_FOUND) {
      throw new Error(
        `Resource not found: ${response.status} ${response.statusText}`
      );
    } else {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.message}`
      );
    }
  }

  return response.json();
};

export const del = async (
  url: string,
  options: ClientSideOptions = { redirect: true }
) => {
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (options.redirect && handleRedirect(response)) {
    return null;
  }
  return response;
};
