import styles from '../../../../styles/shared.module.css';
import RefreshIcon from '../../../../components/icons/RefreshIcon';

interface Prop {
  onRefresh: () => void;
}

export function RefreshButton({ onRefresh }: Readonly<Prop>) {
  return (
    <button
      onClick={() => onRefresh()}
      aria-label="Refresh"
      type="button"
      className={styles.btnIcon}
    >
      <RefreshIcon />
    </button>
  );
}
