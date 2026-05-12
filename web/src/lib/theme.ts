export type Theme = 'light' | 'dark' | 'gold' | 'purple';

const STORAGE_KEY = '2anki-theme';
const VALID_THEMES: ReadonlySet<string> = new Set(['light', 'dark', 'gold', 'purple']);

export const THEME_CHANGE_EVENT = '2anki-theme-change';

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
  globalThis.dispatchEvent?.(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}

export function initTheme(): void {
  applyTheme(getStoredTheme());
}
