import { useEffect, useState } from "react";
import LocalCheckbox from "./LocalCheckbox";
import TemplateSelect from "./TemplateSelect";
import ClearNotification from "./ClearNotification";

const options = [
  {
    key: "all",
    label: "Use all toggle lists",
    default: localStorage.getItem("all") === "true" || false,
  },
  {
    key: "paragraph",
    label: "Use plain text for back",
    default: localStorage.getItem("paragraph") === "true" || false,
  },
  {
    key: "cherry",
    label: "Enable cherry picking using 🍒 emoji",
    default: localStorage.getItem("cherry") === "true" || false,
  },
  {
    key: "avocado",
    label: "Only create flashcards from toggles that don't have the 🥑 emoji",
    default: localStorage.getItem("avocado") === "true" || false,
  },
  {
    key: "tags",
    label: "Treat strikethrough as tags",
    default: localStorage.getItem("tags") === "true" || true,
  },
  {
    key: "basic",
    label: "Basic front and back",
    default: localStorage.getItem("basic") === "true" || true,
  },
  {
    key: "cloze",
    label: "Cloze deletion",
    default: localStorage.getItem("cloze") === "true" || true,
  },

  {
    key: "enable-input",
    label: "Treat bold text as input",
    default: localStorage.getItem("enable-input") === "true" || false,
  },
  {
    key: "basic-reversed",
    label: "Basic and reversed",
    default: localStorage.getItem("basic-reversed") === "true" || false,
  },
  {
    key: "reversed",
    label: "Just the reversed",
    default: localStorage.getItem("reversed") === "true" || false,
  },
  {
    key: "no-underline",
    label: "Remove underlines",
    default: localStorage.getItem("no-underline") === "true" || false,
  },
  {
    key: "max-one-toggle-per-card",
    label: "Maximum one toggle per card",
    default:
      localStorage.getItem("max-one-toggle-per-card") === "true" || false,
  },
];

const CardOptions = () => {
  const [clearNotification, showClearNotification] = useState(false);

  // Make sure the defaults are set if not present to ensure backwards compatability
  useEffect(() => {
    for (const option of options) {
      const value = localStorage.getItem(option.key);
      if (value === null) {
        localStorage.setItem(option.key, option.default.toString());
      }
    }
  }, []);

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
        {options.map((o) => (
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
