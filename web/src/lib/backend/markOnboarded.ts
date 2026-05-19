export async function markOnboarded(): Promise<void> {
  try {
    await fetch('/api/users/me/onboarded', {
      method: 'PATCH',
      credentials: 'include',
    });
  } catch {
    // silent — the tour is already hidden; the server will receive this on next visit
  }
}
