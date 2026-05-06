import styles from '../../../../styles/shared.module.css';

interface Prop {
  onRefresh: () => void;
}

export function RefreshButton({ onRefresh }: Prop) {
  return (
    <button
      onClick={() => onRefresh()}
      aria-label="refresh"
      type="button"
      className={styles.btnIcon}
    >
      <i className="fa-solid fa-arrows-rotate" />
    </button>
  );
}
