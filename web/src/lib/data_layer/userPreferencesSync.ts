export const CARD_OPTION_KEYS = [
  'deckName',
  'font-size',
  'template',
  'toggle-mode',
  'page-emoji',
  'basic_model_name',
  'cloze_model_name',
  'input_model_name',
  'user-instructions',
  'skip-defaults',
] as const;

const PREFERENCES_URL = '/api/users/me/preferences';
const MIGRATE_URL = '/api/users/me/preferences/migrate';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function cancelPendingSync(): void {
  if (debounceTimer != null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function collectCardOptions(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of CARD_OPTION_KEYS) {
    const value = localStorage.getItem(key);
    if (value != null) {
      result[key] = value;
    }
  }
  return result;
}

export function scheduleSync(): void {
  cancelPendingSync();
  debounceTimer = setTimeout(async () => {
    debounceTimer = null;
    const cardOptions = collectCardOptions();
    const theme = localStorage.getItem('2anki-theme');
    const body: Record<string, unknown> = {};
    if (Object.keys(cardOptions).length > 0) {
      body.cardOptions = cardOptions;
    }
    if (theme != null) {
      body.theme = theme;
    }
    if (Object.keys(body).length === 0) return;
    try {
      await fetch(PREFERENCES_URL, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      // silent — next save will retry
    }
  }, 500);
}

export async function hydrateFromServer(): Promise<void> {
  try {
    const res = await fetch(PREFERENCES_URL, { credentials: 'include' });
    if (!res.ok) return;
    const { cardOptions, theme } = await res.json();
    if (cardOptions != null && typeof cardOptions === 'object') {
      for (const [key, value] of Object.entries(cardOptions)) {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      }
    }
    if (typeof theme === 'string') {
      localStorage.setItem('2anki-theme', theme);
    }
  } catch {
    // silent
  }
}

export async function migrateToServer(): Promise<void> {
  const cardOptions = collectCardOptions();
  const theme = localStorage.getItem('2anki-theme');
  const body: Record<string, unknown> = {};
  if (Object.keys(cardOptions).length > 0) {
    body.cardOptions = cardOptions;
  }
  if (theme != null) {
    body.theme = theme;
  }
  if (Object.keys(body).length === 0) return;
  try {
    await fetch(MIGRATE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // silent
  }
}
