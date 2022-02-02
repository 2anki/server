interface SwitchProps {
  title: string;
  id: string;
  checked: boolean;
  onSwitched: () => void;
}

const Switch = ({ title, id, checked, onSwitched }: SwitchProps) => {
  return (
    <div
      className="field is-flex is-justify-content-space-between is-flex-direction-column"
      onClick={() => onSwitched()}
    >
      <input
        id={id}
        type="checkbox"
        name={id}
        className="switch is-rounded is-info"
        checked={checked}
      />
      <label htmlFor="switchRoundedInfo">{title}</label>
    </div>
  );
};

export default Switch;
