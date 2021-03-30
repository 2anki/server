import { useState } from "react";

const LocalCheckbox: React.FC<{
  heading: string;
  label: string;
  storageKey: string;
  startValue: boolean;
}> = ({ heading, label, storageKey, startValue }) => {
  const local = localStorage.getItem(storageKey) === "true" || startValue;
  const [isValue, setIsValue] = useState(local);
  const toggleValue = () => {
    const empty = !isValue;
    localStorage.setItem(storageKey, empty.toString());
    setIsValue(empty);
  };
  return (
    <>
      {heading ? <strong>{heading}</strong> : null}
      <div className="field">
        <input
          style={{ marginRight: "0.2rem" }}
          type="checkbox"
          checked={isValue}
          onChange={toggleValue}
        />
        {label}
      </div>
    </>
  );
};

export default LocalCheckbox;
