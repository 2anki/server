import { useEffect, useRef, useState } from 'react';
import styles from '../styles/shared.module.css';
import localStyles from './FontSizePicker.module.css';

interface FontPickerDelegate {
  fontSize: string;
  pickedFontSize: (fs: string) => void;
}

const DESCRIPTION = 'Controls the base font size in your generated cards. Range: 10–100 px.';

function FontSizePicker(delegate: Readonly<FontPickerDelegate>) {
  const { fontSize, pickedFontSize } = delegate;
  const displayValue = fontSize || '20';
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className={styles.flexColumn}>
      <div className={localStyles.labelRow}>
        <label htmlFor="font-size">
          <strong>Font size</strong>
        </label>
        <div ref={wrapperRef} className={styles.infoAnchor}>
          <button
            type="button"
            className={styles.infoButton}
            aria-label={open ? 'Hide description' : DESCRIPTION}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
              <path d="M7 6v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
              <circle cx="7" cy="4.25" r="0.625" fill="currentColor" />
            </svg>
          </button>
          {open && (
            <div className={styles.infoPopover} role="tooltip">
              {DESCRIPTION}
            </div>
          )}
        </div>
      </div>
      <div className={styles.flexRow} style={{ width: '100%', gap: '0.75rem', alignItems: 'center' }}>
        <input
          id="font-size"
          name="font-size"
          type="range"
          min="10"
          max="100"
          value={displayValue}
          onChange={(event) => pickedFontSize(event.target.value)}
          style={{ flex: 1, accentColor: 'var(--color-primary)' }}
        />
        <span style={{ minWidth: '3.5rem', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {displayValue} px
        </span>
      </div>
    </div>
  );
}

export default FontSizePicker;
