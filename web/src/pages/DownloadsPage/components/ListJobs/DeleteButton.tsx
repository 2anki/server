import styles from '../../../../styles/shared.module.css';

interface Prop {
  onDelete: () => void;
}

export function DeleteButton({ onDelete }: Readonly<Prop>) {
  return (
    <button
      aria-label="delete"
      type="button"
      className={styles.btnGhost}
      onClick={() => onDelete()}
    >
      ❌
    </button>
  );
}
