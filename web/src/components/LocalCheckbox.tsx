import { useState } from "react";

const LocalCheckbox: React.FC<{
  heading: string;
  label: string;
  key: string;
  startValue: boolean | string;
}> = ({ heading, label, key, startValue }) => {
  const local = localStorage.getItem(key);
  const [isValue, setIsValue] = useState(local !== "true");
  const toggleValue = () => {
    const empty = !isValue;
    localStorage.setItem(key, empty.toString());
    setIsValue(empty);
  };
  return (
    <div className="field">
      <strong>{heading}</strong>
      <div className="field">
        <input
          style={{ marginRight: "0.2rem" }}
          type="checkbox"
          checked={isValue}
          onChange={toggleValue}
        />
        {label}
      </div>
    </div>
  );
};

export default LocalCheckbox;
