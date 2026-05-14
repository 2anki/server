import styles from '../../styles/shared.module.css';

interface SwitchProps {
  title: string;
  id: string;
  checked: boolean;
  onSwitched: () => void;
}

function Switch({ title, id, checked, onSwitched }: Readonly<SwitchProps>) {
  return (
    <div className={styles.checkboxControl}>
      <input
        id={id}
        type="checkbox"
        name={id}
        checked={checked}
        onChange={() => onSwitched()}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        {title}
      </label>
    </div>
  );
}

export default Switch;
