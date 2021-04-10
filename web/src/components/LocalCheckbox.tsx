import React, { useEffect, useState } from "react";
import CardOptionsStore from "../store/Options";

const LocalCheckbox: React.FC<{
  label: string;
  storageKey: string;
  description: string | null;
  store: CardOptionsStore;
}> = ({ label, storageKey, store, description = null }) => {
  const value = store.get(storageKey)?.value || false;
  const [isChecked, setChecked] = useState(value);

  useEffect(() => {
    const storeValue = store.get(storageKey)?.value || false;
    if (isChecked !== storeValue) {
      setChecked(storeValue);
    }
  }, [isChecked, storageKey, store, store.options]);

  return (
    <>
      <label className="checkbox">
        <input
          style={{ marginRight: "0.2rem" }}
          type="checkbox"
          checked={isChecked}
          onChange={(event) => {
            setChecked(event.target.checked);
            store.update(storageKey, event.target.checked);
          }}
        />
        <strong>{label}</strong>
      </label>
      {description && <p className="is-size-7	">{description}</p>}
    </>
  );
};

export default LocalCheckbox;
