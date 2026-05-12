import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getStoredTheme,
  applyTheme,
  getStoredPalette,
  applyPalette,
  initTheme,
} from './theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-palette');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-palette');
  });

  describe('getStoredTheme', () => {
    it('returns light when nothing is stored', () => {
      expect(getStoredTheme()).toBe('light');
    });

    it('returns the stored theme', () => {
      localStorage.setItem('2anki-theme', 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    it('returns light for invalid stored values', () => {
      localStorage.setItem('2anki-theme', 'neon');
      expect(getStoredTheme()).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('removes data-theme attribute for light', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });

    it('sets data-theme to dark', () => {
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('sets data-theme to gold', () => {
      applyTheme('gold');
      expect(document.documentElement.getAttribute('data-theme')).toBe('gold');
    });

    it('persists the choice to localStorage', () => {
      applyTheme('gold');
      expect(localStorage.getItem('2anki-theme')).toBe('gold');
    });
  });

  describe('getStoredPalette', () => {
    it('returns blue when nothing is stored', () => {
      expect(getStoredPalette()).toBe('blue');
    });

    it('returns the stored palette', () => {
      localStorage.setItem('2anki-palette', 'purple');
      expect(getStoredPalette()).toBe('purple');
    });

    it('returns blue for invalid stored values', () => {
      localStorage.setItem('2anki-palette', 'orange');
      expect(getStoredPalette()).toBe('blue');
    });
  });

  describe('applyPalette', () => {
    it('removes data-palette attribute for blue', () => {
      document.documentElement.setAttribute('data-palette', 'green');
      applyPalette('blue');
      expect(document.documentElement.getAttribute('data-palette')).toBeNull();
    });

    it('sets data-palette to purple', () => {
      applyPalette('purple');
      expect(document.documentElement.getAttribute('data-palette')).toBe('purple');
    });

    it('sets data-palette to green', () => {
      applyPalette('green');
      expect(document.documentElement.getAttribute('data-palette')).toBe('green');
    });

    it('sets data-palette to red', () => {
      applyPalette('red');
      expect(document.documentElement.getAttribute('data-palette')).toBe('red');
    });

    it('persists the choice to localStorage', () => {
      applyPalette('green');
      expect(localStorage.getItem('2anki-palette')).toBe('green');
    });
  });

  describe('initTheme', () => {
    it('applies the stored theme on init', () => {
      localStorage.setItem('2anki-theme', 'gold');
      initTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('gold');
    });

    it('defaults to light when nothing stored', () => {
      initTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });

    it('applies the stored palette on init', () => {
      localStorage.setItem('2anki-palette', 'red');
      initTheme();
      expect(document.documentElement.getAttribute('data-palette')).toBe('red');
    });

    it('defaults to blue palette (no attribute) when nothing stored', () => {
      initTheme();
      expect(document.documentElement.getAttribute('data-palette')).toBeNull();
    });
  });
});
