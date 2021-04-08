import { useState } from "react";
import styled from "styled-components";

import TemplateName from "./TemplateName";
import TemplateSelect from "./TemplateSelect";
import FontSizePicker from "./FontSizePicker";
import BlueTintedBox from "./BlueTintedBox";
import LocalCheckbox from "./LocalCheckbox";
import ClearNotification from "./ClearNotification";
import CardOptionsStore from "../store/Options";

const StyledInput = styled.input`
  font-weight: bold;
  color: #83c9f5;
`;

const Settings: React.FC<{ store: CardOptionsStore }> = ({ store }) => {
  const deckNameKey = "deckName";
  const [deckName, setDeckName] = useState(
    localStorage.getItem(deckNameKey) || ""
  );
  const [clearNotification, showClearNotification] = useState(false);

  return (
    <div className="container">
      <h2 className="title">Settings</h2>
      <hr />
      <LocalCheckbox
        storageKey="empty-description"
        label="Empty Deck Description"
        description="Anki supports deck descriptions. We use this to tell people that the deck was created via this website."
        startValue={false}
      />
      <div className="field">
        <strong>Deck Name</strong>
        <p className="is-size-7">
          You can use this to change the default name which comes from the
          Notion page. If you have an existing deck in Anki you want to update
          then you can also set the name here. It works like Anki so you can
          create groupings (Parent::Child).
        </p>
        <div className="control">
          <StyledInput
            className="input"
            placeholder="Enter deck name (optional)"
            value={deckName}
            onChange={(event) => {
              const newName = event.target.value;
              if (newName !== deckName) {
                setDeckName(newName);
                localStorage.setItem(deckNameKey, deckName);
              }
            }}
          />
        </div>
      </div>
      <h2 className="title is-3">Card Options</h2>
      <div className="container">
        <BlueTintedBox>
          <strong>Toggle Mode</strong>
          <p className="is-size-7">
            If you use nested toggles in your flashcards then this option is
            useful in the case where you want to collapse them so you can open
            them manually when you want in Anki.
          </p>
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
              label={o.label}
              startValue={o.default}
              description={o.description}
            />
          ))}
        </BlueTintedBox>
      </div>
      <h2 className="title is-3">Template Options</h2>
      <BlueTintedBox>
        <TemplateSelect
          values={[
            { value: "specialstyle", label: "Default" },
            { value: "notionstyle", label: "Only Notion" },
            { value: "nostyle", label: "Raw Note (no style)" },
            { value: "abhiyan", label: "Abhiyan Bhandari (Night Mode)" },
          ]}
          defaultValue="close_toggle"
          storageKey="toggle-mode"
        />
        <TemplateName
          storageKey="basic_model_name"
          placeholder="Defaults to n2a-basic"
          label="Basic Template Name"
        />
        <TemplateName
          storageKey="cloze_model_name"
          placeholder="Defaults to n2a-cloze"
          label="Cloze Template Name"
        />
        <TemplateName
          storageKey="input_model_name"
          placeholder="Defaults to n2a-input"
          label="Input Template Name"
        />

        <FontSizePicker />

        <hr />
        <h2>Preview support is coming soon</h2>
        <p>
          Track the progress here
          <a
            style={{ paddingLeft: "0.2rem" }}
            rel="noreferrer"
            target="_blank"
            href="https://github.com/alemayhu/Notion-to-Anki/projects/2"
          >
            Card Type Template Manager
          </a>
        </p>
      </BlueTintedBox>
      <div className="has-text-centered">
        <button
          className="button is-danger"
          onClick={() => {
            store.clear();
            showClearNotification(true);
          }}
        >
          Clear
        </button>
        {clearNotification ? (
          <ClearNotification
            seconds={3}
            msg="Reverted to the default settings"
            setShow={showClearNotification}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Settings;
