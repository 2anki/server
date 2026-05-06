export function getGoogleRedirectUri() {
  const redirectUri = new URL('/api/users/auth/google', window.location.href).toString();
  return redirectUri;
}
