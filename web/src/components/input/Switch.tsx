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
      className="field is-flex is-justify-content-space-between is-flex-direction-column"
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
        className="switch is-rounded is-info"
        checked={checked}
        onChange={() => onSwitched()}
      />
      <label htmlFor="switchRoundedInfo">{title}</label>
    </div>
  );
}

export default Switch;
