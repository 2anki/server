import { useEffect } from "react";
import LocalCheckbox from "./LocalCheckbox";

const options = [
  {
    type: "all",
    label: "Use all toggle lists",
    default: localStorage.getItem("all") || false,
  },
  {
    type: "paragraph",
    label: "Use plain text for back",
    default: localStorage.getItem("paragraph") || false,
  },
  {
    type: "cherry",
    label: "Enable cherry picking using 🍒 emoji",
    default: localStorage.getItem("cherry") || false,
  },
  {
    type: "tags",
    label: "Treat strikethrough as tags",
    default: localStorage.getItem("tags") || true,
  },
  {
    type: "basic",
    label: "Basic front and back",
    default: localStorage.getItem("basic") || true,
  },
  {
    type: "cloze",
    label: "Cloze deletion",
    default: localStorage.getItem("cloze") || true,
  },

  {
    type: "enable-input",
    label: "Treat bold text as input",
    default: localStorage.getItem("enable-input") || false,
  },
  {
    type: "basic-reversed",
    label: "Basic and reversed",
    default: localStorage.getItem("basic-reversed") || false,
  },
  {
    type: "reversed",
    label: "Just the reversed",
    default: localStorage.getItem("reversed") || false,
  },
  {
    type: "no-underline",
    label: "Remove underlines",
    default: localStorage.getItem("no-underline") || false,
  },
  {
    type: "max-one-toggle-per-card",
    label: "Maximum one toggle per card",
    default: localStorage.getItem("max-one-toggle-per-card") || false,
  },
];

const CardOptions = () => {
  // Make sure the defaults are set if not present to ensure backwards compatability
  useEffect(() => {
    for (const option of options) {
      const value = localStorage.getItem(option.type);
      if (value === null) {
        localStorage.setItem(option.type, option.default.toString());
      }
    }
  }, []);

  return (
    <div className="container">
      <div className="has-text-centered">
        <h2 className="title">Card Options</h2>
      </div>
      <div className="box">
        {options.map((o) => (
          <LocalCheckbox
            key={o.type}
            heading=""
            label={o.label}
            startValue={o.default}
          />
        ))}
      </div>
    </div>
  );
};

export default CardOptions;
