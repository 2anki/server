import { useState } from "react";

const TemplateName: React.FC<{
  storageKey: string;
  label: string;
  placeholder: string;
}> = ({ storageKey, label, placeholder }) => {
  const [value, setValue] = useState(localStorage.getItem(storageKey) || "");

  return (
    <div className="field">
      <label>{label}</label>
      <div className="control">
        <input
          type="text"
          className="input"
          placeholder={placeholder}
          name={storageKey}
          value={value}
          onChange={(event) => {
            const newValue = event.target.value;
            setValue(newValue);
            localStorage.setItem(storageKey, newValue);
          }}
        />
      </div>
    </div>
  );
};

export default TemplateName;
