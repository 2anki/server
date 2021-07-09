import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

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
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("font-size") || ""
  );
  const availableTemplates = [
    { value: "specialstyle", label: "Default" },
    { value: "notionstyle", label: "Only Notion" },
    { value: "nostyle", label: "Raw Note (no style)" },
    {
      value: "abhiyan",
      label: "Abhiyan Bhandari (Night Mode)",
    },
  ];
  const [template, setTemplate] = useState(
    localStorage.getItem("template") || "specialstyle"
  );
  const [toggleMode, setToggleMode] = useState(
    localStorage.getItem("toggle-mode") || "close_toggle"
  );
  const [basicName, setBasicName] = useState(
    localStorage.getItem("basic_model_name") || ""
  );
  const [clozeName, setClozeName] = useState(
    localStorage.getItem("cloze_model_name") || ""
  );
  const [inputName, setInputName] = useState(
    localStorage.getItem("input_model_name") || ""
  );

  const resetStore = () => {
    store.clear();
    setFontSize("20");
    setToggleMode("close_toggle");
    setTemplate("specialstyle");
    setOptions([...store.options]);
    setDeckName("");
    setBasicName("");
    setClozeName("");
    setInputName("");
  };
  return (
    <div className={`modal ${isActive ? "is-active" : ""}`}>
      <div className="modal-background"></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <div className="modal-card-title">Settings</div>
          <button
            className="delete"
            aria-label="close"
            onClick={onClickClose}
          ></button>
        </div>
        <section className="modal-card-body">
          <div className="container">
            <div className="field">
              <strong>Deck Name</strong>
              <p className="is-size-7">
                You can use this to change the default name which comes from the
                Notion page. If you have an existing deck in Anki you want to
                update then you can also set the name here. It works like Anki
                so you can create groupings (Parent::Child). Please don't change
                the deck name if you have subpages, it's more reliable to leave
                this empty if you have subpages.
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
                    }
                    localStorage.setItem(deckNameKey, newName);
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
                  value={toggleMode}
                  name="toggle-mode"
                  pickedTemplate={(t) => {
                    setToggleMode(t);
                    localStorage.setItem("toggle-mode", t);
                  }}
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
                values={availableTemplates}
                value={template}
                name="template"
                pickedTemplate={(t) => {
                  setTemplate(t);
                  localStorage.setItem("template", t);
                }}
              />
              <TemplateName
                name="basic_model_name"
                value={basicName}
                placeholder="Defaults to n2a-basic"
                label="Basic Template Name"
                pickedName={(name) => {
                  setBasicName(name);
                  localStorage.setItem("basic_model_name", name);
                }}
              />
              <TemplateName
                name="cloze_model_name"
                value={clozeName}
                placeholder="Defaults to n2a-cloze"
                label="Cloze Template Name"
                pickedName={(name) => {
                  setClozeName(name);
                  localStorage.setItem("cloze_model_name", name);
                }}
              />
              <TemplateName
                name="input_model_name"
                value={inputName}
                placeholder="Defaults to n2a-input"
                label="Input Template Name"
                pickedName={(name) => {
                  setInputName(name);
                  localStorage.setItem("input_model_name", name);
                }}
              />

              <FontSizePicker
                fontSize={fontSize}
                pickedFontSize={(fs) => {
                  setFontSize(fs);
                  localStorage.setItem("font-size", fs.toString());
                }}
              />

              <hr />
              <h2>Preview support is coming soon</h2>
              <button className="button">
                <Link to="/tm">Edit Template</Link>
              </button>
            </BlueTintedBox>
          </div>
        </section>
        <div className="modal-card-foot is-justify-content-center">
          <button className="button" onClick={onClickClose}>
            Done
          </button>
          <button className="button is-danger" onClick={() => resetStore()}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
