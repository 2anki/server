export type Theme = 'light' | 'dark' | 'gold';
export type Palette = 'blue' | 'purple' | 'green' | 'red';

const THEME_KEY = '2anki-theme';
const PALETTE_KEY = '2anki-palette';
const VALID_THEMES: ReadonlySet<string> = new Set(['light', 'dark', 'gold']);
const VALID_PALETTES: ReadonlySet<string> = new Set(['blue', 'purple', 'green', 'red']);

export const THEME_CHANGE_EVENT = '2anki-theme-change';
export const PALETTE_CHANGE_EVENT = '2anki-palette-change';

export function getStoredTheme(): Theme {
  const stored = globalThis.localStorage?.getItem(THEME_KEY);
  if (stored && VALID_THEMES.has(stored)) {
    return stored as Theme;
  }
  return 'light';
}

export function getStoredPalette(): Palette {
  const stored = globalThis.localStorage?.getItem(PALETTE_KEY);
  if (stored && VALID_PALETTES.has(stored)) {
    return stored as Palette;
  }
  return 'blue';
}

export function applyTheme(theme: Theme): void {
  if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  globalThis.localStorage?.setItem(THEME_KEY, theme);
  globalThis.dispatchEvent?.(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}

export function applyPalette(palette: Palette): void {
  if (palette === 'blue') {
    document.documentElement.removeAttribute('data-palette');
  } else {
    document.documentElement.setAttribute('data-palette', palette);
  }
  globalThis.localStorage?.setItem(PALETTE_KEY, palette);
  globalThis.dispatchEvent?.(new CustomEvent(PALETTE_CHANGE_EVENT, { detail: palette }));
}

export function initTheme(): void {
  applyTheme(getStoredTheme());
  applyPalette(getStoredPalette());
}
