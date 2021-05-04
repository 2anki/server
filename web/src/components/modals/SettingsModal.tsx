import React, { useContext, useState } from "react";
import styled from "styled-components";

import { Modal, Button } from "trunx";
import StoreContext from "../../store/StoreContext";
import BlueTintedBox from "../BlueTintedBox";
import FontSizePicker from "../FontSizePicker";
import LocalCheckbox from "../LocalCheckbox";
import TemplateName from "../TemplateName";
import TemplateSelect from "../TemplateSelect";

const StyledInput = styled.input`
  font-weight: bold;
  color: #83c9f5;
`;

const SettingsModal: React.FC<{
  isActive: boolean;
  onClickClose: React.MouseEventHandler;
}> = ({ isActive, onClickClose }) => {
  const deckNameKey = "deckName";
  const [deckName, setDeckName] = useState(
    localStorage.getItem(deckNameKey) || ""
  );
  const store = useContext(StoreContext);
  const [options, setOptions] = useState(store.options);

  const resetStore = () => {
    store.clear();
    setOptions([...store.options]);
  };
  return (
    <Modal isActive={isActive}>
      <Modal.Background></Modal.Background>
      <Modal.Card>
        <Modal.Card.Head>
          <Modal.Card.Title>Settings</Modal.Card.Title>
          <button
            className="delete"
            aria-label="close"
            onClick={onClickClose}
          ></button>
        </Modal.Card.Head>
        <section className="modal-card-body">
          <div className="container">
            <div className="field">
              <strong>Deck Name</strong>
              <p className="is-size-7">
                You can use this to change the default name which comes from the
                Notion page. If you have an existing deck in Anki you want to
                update then you can also set the name here. It works like Anki
                so you can create groupings (Parent::Child).
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
                  If you use nested toggles in your flashcards then this option
                  is useful in the case where you want to collapse them so you
                  can open them manually when you want in Anki.
                </p>
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
                    store={store}
                    key={o.key}
                    storageKey={o.key}
                    label={o.label}
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
                  {
                    value: "abhiyan",
                    label: "Abhiyan Bhandari (Night Mode)",
                  },
                ]}
                defaultValue="specialstyle"
                storageKey="template"
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
          </div>
        </section>
        <Modal.Card.Foot isJustifyContentCenter>
          <Button onClick={onClickClose}>Done</Button>
          <Button isDanger onClick={() => resetStore()}>
            Clear
          </Button>
        </Modal.Card.Foot>
      </Modal.Card>
    </Modal>
  );
};

export default SettingsModal;
