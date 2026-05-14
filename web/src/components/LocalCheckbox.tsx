import { useEffect, useRef, useState } from 'react';
import styles from '../styles/shared.module.css';

interface Props {
  label: string;
  defaultValue: boolean;
  description: string | null;
  onChecked: (checked: boolean) => void;
  badge?: string;
}

function LocalCheckbox({
  label,
  defaultValue,
  description = null,
  onChecked,
  badge,
}: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const id = `chk-${label}`;

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
    <div className={styles.checkboxRow}>
      <div className={styles.checkboxControl}>
        <input
          id={id}
          name={label}
          type="checkbox"
          checked={defaultValue}
          onChange={(event) => onChecked(event.target.checked)}
        />
        <label htmlFor={id} className={styles.checkboxLabel}>
          <strong>{label}</strong>
          {badge && <span className={styles.checkboxBadge}>{badge}</span>}
        </label>
      </div>
      {description && (
        <div ref={wrapperRef} className={styles.infoAnchor}>
          <button
            type="button"
            className={styles.infoButton}
            aria-label={open ? 'Hide description' : 'Show description'}
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
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocalCheckbox;
