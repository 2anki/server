import styles from '../../styles/shared.module.css';

interface SwitchProps {
  title: string;
  id: string;
  checked: boolean;
  onSwitched: () => void;
}

function Switch({ title, id, checked, onSwitched }: SwitchProps) {
  return (
    <div
      tabIndex={-12}
      role="button"
      className={styles.switchField}
      onClick={() => onSwitched()}
      onKeyDown={(event) => {
        if (event.altKey && event.key === id) {
          onSwitched();
        }
      }}
    >
      <input
        id={id}
        type="checkbox"
        name={id}
        className="switch"
        checked={checked}
        onChange={() => onSwitched()}
      />
      <label htmlFor="switchRoundedInfo">{title}</label>
    </div>
  );
}

export default Switch;
