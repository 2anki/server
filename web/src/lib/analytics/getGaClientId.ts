export function getGaClientId(): string {
  const match = document.cookie.match(/_ga=([^;]+)/);
  return match ? match[1] : '';
}
