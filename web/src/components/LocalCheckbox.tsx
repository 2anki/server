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
      </span>
      {description && (
        <p className={styles.checkboxDescription}>{description}</p>
      )}
    </label>
  );
}

export default LocalCheckbox;
