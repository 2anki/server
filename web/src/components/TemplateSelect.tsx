import { useState } from "react";

interface SelectOption {
  value: string;
  label: string;
}

// TODO: rename to not use Template in name
const TemplateSelect: React.FC<{
  storageKey: string;
  defaultValue: string;
  values: SelectOption[];
  callback?: (value: string) => void;
}> = ({ storageKey, defaultValue, values, callback }) => {
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
              if (callback) {
                callback(value);
              }
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
