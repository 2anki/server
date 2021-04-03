import { useState } from "react";
import LocalCheckbox from "./LocalCheckbox";
import TemplateSelect from "./TemplateSelect";
import ClearNotification from "./ClearNotification";
import CARD_OPTIONS from "../model/Options";

const CardOptions = () => {
  const [clearNotification, showClearNotification] = useState(false);

  return (
    <div className="container">
      {clearNotification ? (
        <ClearNotification
          seconds={3}
          msg="Reverted to the default settings"
          setShow={showClearNotification}
        />
      ) : null}
      <div className="has-text-centered">
        <h2 className="title">Card Options</h2>
      </div>
      <div className="box">
        <TemplateSelect
          values={[
            { label: "Open nested toggles", value: "open_toggle" },
            { label: "Close nested toggles", value: "close_toggle" },
          ]}
          defaultValue="close_toggle"
          storageKey="toggle-mode"
        />
        {CARD_OPTIONS.map((o) => (
          <LocalCheckbox
            key={o.key}
            storageKey={o.key}
            heading=""
            label={o.label}
            startValue={o.default}
          />
        ))}
      </div>
      <button
        className="button"
        onClick={() => {
          localStorage.clear();
          showClearNotification(true);
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default CardOptions;
