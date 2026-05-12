export type Theme = 'light' | 'dark' | 'gold';

const STORAGE_KEY = '2anki-theme';
const VALID_THEMES: ReadonlySet<string> = new Set(['light', 'dark', 'gold']);

export function getStoredTheme(): Theme {
  const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (stored && VALID_THEMES.has(stored)) {
    return stored as Theme;
  }
  return 'light';
}

export function applyTheme(theme: Theme): void {
  if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  globalThis.localStorage?.setItem(STORAGE_KEY, theme);
}

export function initTheme(): void {
  applyTheme(getStoredTheme());
}
