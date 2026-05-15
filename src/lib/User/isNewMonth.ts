export function isNewMonth(startedAt: Date, now: Date): boolean {
  const startedYear = startedAt.getUTCFullYear();
  const startedMonth = startedAt.getUTCMonth();
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();

  if (startedYear < nowYear) return true;
  if (startedYear > nowYear) return false;
  return startedMonth < nowMonth;
}
