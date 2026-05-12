import { useState } from 'react';
import {
  type Theme,
  type Palette,
  applyTheme,
  applyPalette,
  getStoredTheme,
  getStoredPalette,
} from '../../lib/theme';
import styles from './ThemeSwitcher.module.css';

const THEMES: readonly { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light theme', icon: '☀' },
  { value: 'dark', label: 'Dark theme', icon: '☾' },
  { value: 'gold', label: 'Gold theme', icon: '✦' },
];

const PALETTES: readonly { value: Palette; label: string; swatch: string }[] = [
  { value: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { value: 'purple', label: 'Purple', swatch: '#7c6cc4' },
  { value: 'green', label: 'Green', swatch: '#3d9a7c' },
  { value: 'red', label: 'Red', swatch: '#d4585c' },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getStoredTheme);
  const [currentPalette, setCurrentPalette] = useState<Palette>(getStoredPalette);

  function handleTheme(theme: Theme) {
    setCurrentTheme(theme);
    applyTheme(theme);
  }

  function handlePalette(palette: Palette) {
    setCurrentPalette(palette);
    applyPalette(palette);
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>Appearance</span>
      <div className={styles.switcher} role="radiogroup" aria-label="Theme">
        {THEMES.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={currentTheme === value}
            aria-label={label}
            title={label}
            className={`${styles.option} ${currentTheme === value ? styles.optionActive : ''}`}
            onClick={() => handleTheme(value)}
          >
            {icon}
          </button>
        ))}
      </div>
      <div className={styles.paletteRow} role="radiogroup" aria-label="Accent color">
        {PALETTES.map(({ value, label, swatch }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={currentPalette === value}
            aria-label={label}
            title={label}
            className={`${styles.paletteDot} ${currentPalette === value ? styles.paletteDotActive : ''}`}
            style={{ backgroundColor: swatch, color: swatch }}
            onClick={() => handlePalette(value)}
          />
        ))}
      </div>
    </div>
  );
}
