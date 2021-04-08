import { useState } from "react";

const LocalCheckbox: React.FC<{
  label: string;
  storageKey: string;
  startValue: boolean;
  description: string | null;
}> = ({ label, storageKey, startValue, description = null }) => {
  const local = localStorage.getItem(storageKey) === "true" || startValue;
  const [isValue, setIsValue] = useState(local);
  const toggleValue = () => {
    const empty = !isValue;
    localStorage.setItem(storageKey, empty.toString());
    setIsValue(empty);
  };
  return (
    <>
      <label className="checkbox">
        <input
          style={{ marginRight: "0.2rem" }}
          type="checkbox"
          checked={isValue}
          onChange={toggleValue}
        />
        <strong>{label}</strong>
      </label>
      {description && <p className="is-size-7	">{description}</p>}
    </>
  );
};

export default LocalCheckbox;
