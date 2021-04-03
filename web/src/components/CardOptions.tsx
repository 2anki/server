import { useState } from "react";
import LocalCheckbox from "./LocalCheckbox";
import TemplateSelect from "./TemplateSelect";
import ClearNotification from "./ClearNotification";
import CardOptionsStore from "../store/Options";
import BlueTintedBox from "./BlueTintedBox";

const CardOptions: React.FC<{ store: CardOptionsStore }> = ({ store }) => {
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
      <BlueTintedBox>
        <TemplateSelect
          values={[
            { label: "Open nested toggles", value: "open_toggle" },
            { label: "Close nested toggles", value: "close_toggle" },
          ]}
          defaultValue="close_toggle"
          storageKey="toggle-mode"
        />
        {store.options.map((o) => (
          <LocalCheckbox
            key={o.key}
            storageKey={o.key}
            heading=""
            label={o.label}
            startValue={o.default}
          />
        ))}
      </BlueTintedBox>
      <button
        className="button is-danger"
        onClick={() => {
          store.clear();
          showClearNotification(true);
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default CardOptions;
