import styles from '../../styles/shared.module.css';

interface SwitchProps {
  title: string;
  id: string;
  checked: boolean;
  onSwitched: () => void;
}

function Switch({ title, id, checked, onSwitched }: Readonly<SwitchProps>) {
  return (
    <label htmlFor={id} className={styles.switchField}>
      <input
        id={id}
        type="checkbox"
        name={id}
        className="switch"
        checked={checked}
        onChange={() => onSwitched()}
      />
      {title}
    </label>
  );
}

export default Switch;
