import { useState } from "react";

interface SelectOption {
  value: string;
  label: string;
}

const TemplateSelect: React.FC<{
  storageKey: string;
  defaultValue: string;
  values: SelectOption[];
}> = ({ storageKey, defaultValue, values }) => {
  const [value, setValue] = useState(
    localStorage.getItem(storageKey) || defaultValue
  );

  return (
    <div className="field">
      <div className="control">
        <div className="select">
          <select
            name={storageKey}
            value={value}
            onChange={(event) => {
              const value = event.target.value;
              setValue(value);
              localStorage.setItem(storageKey, value);
            }}
          >
            {values.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelect;
