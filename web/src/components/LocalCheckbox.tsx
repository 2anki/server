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
  return (
    <label htmlFor={label} className={styles.checkbox}>
      <input
        name={label}
        type="checkbox"
        checked={defaultValue}
        onChange={(event) => onChecked(event.target.checked)}
      />
      <span className={styles.checkboxLabelRow}>
        <strong>{label}</strong>
        {badge && <span className={styles.checkboxBadge}>{badge}</span>}
        {description && (
          <button
            type="button"
            className={styles.infoButton}
            title={description}
            aria-label={description}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
              <path d="M7 6v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
              <circle cx="7" cy="4.25" r="0.625" fill="currentColor" />
            </svg>
          </button>
        )}
      </span>
    </label>
  );
}

export default LocalCheckbox;
