import styles from '../../../styles/shared.module.css';

interface FlashcardTypeProps {
  active: boolean;
  name: string;
  onSwitch: (name: string) => void;
}

export default function FlashcardType({ name, onSwitch, active }: Readonly<FlashcardTypeProps>) {
  return (
    <button
      type="button"
      onClick={() => onSwitch(name)}
      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
    >
      {name}
    </button>
  );
}
