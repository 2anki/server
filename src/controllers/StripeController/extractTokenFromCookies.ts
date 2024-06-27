export function extractTokenFromCookies(
  cookies: string | undefined
): string | null {
  if (!cookies) {
    return null;
  }

  const cookiesArray = cookies.split('; ');
  const tokenCookie = cookiesArray.find((cookie) =>
    cookie.startsWith('token=')
  );
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}
