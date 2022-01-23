import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Backend from "../../lib/Backend";

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

const persist = (key, value, pageId) => {
  if (pageId) {
    return;
  }
  localStorage.setItem(key, value);
};

const loadValue = (key, defaultValue, settings) => {
  if (settings) {
    try {
      return settings[key] || defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  }
  return localStorage.getItem(key) || defaultValue;
};
const availableTemplates = [
  { value: "specialstyle", label: "Default" },
  { value: "notionstyle", label: "Only Notion" },
  { value: "nostyle", label: "Raw Note (no style)" },
  {
    value: "abhiyan",
    label: "Abhiyan Bhandari (Night Mode)",
  },
  {
    value: "alex_deluxe",
    label: "Alexander Deluxe (Blue)",
  },
];

let backend = new Backend();
const SettingsModal: React.FC<{
  pageTitle?: string;
  pageId?: string;
  isActive: boolean;
  onClickClose: React.MouseEventHandler;
}> = ({ pageTitle, pageId, isActive, onClickClose }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(pageId ? true : false);
  const deckNameKey = "deckName";
  const [deckName, setDeckName] = useState(
    loadValue(
      deckNameKey,
      pageTitle ? pageTitle : localStorage.getItem(deckNameKey) || "",
      settings
    )
  );
  const store = useContext(StoreContext);
  const [options, setOptions] = useState(store.options);
  const [fontSize, setFontSize] = useState(
    loadValue("font-size", "", settings)
  );
  const [template, setTemplate] = useState(
    loadValue("template", "specialstyle", settings)
  );
  const [toggleMode, setToggleMode] = useState(
    loadValue("toggle-mode", "close_toggle", settings)
  );
  const [basicName, setBasicName] = useState(
    loadValue("basic_model_name", "", settings)
  );
  const [clozeName, setClozeName] = useState(
    loadValue("cloze_model_name", "", settings)
  );
  const [inputName, setInputName] = useState(
    loadValue("input_model_name", "", settings)
  );

  useEffect(() => {
    if (pageId) {
      setLoading(true);
      backend
        .getSettings(pageId)
        .then((res) => {
          if (res && res.data) {
            const s = res.data.payload;
            if (s.deckName) {
              setDeckName(s.deckName);
            }
            setToggleMode(s["toggle-mode"]);
            setSettings(s);
          }
          setLoading(false);
        })
        .catch((error) => console.error(error));
    }
  }, [pageId]);

  const resetStore = async () => {
    if (pageId) {
      setDeckName(pageTitle || "");
      await backend.deleteSettings(pageId);
    }
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

  const onSubmit = async (event) => {
    if (!pageId) {
      onClickClose(event);
      return;
    }
    console.log("submit");
    let payload: any = {};
    for (const s of store.options) {
      payload[s.key] = s.value.toString(); // use string for backwards compat
    }
    payload.deckName = deckName;
    payload["toggle-mode"] = toggleMode;
    payload.template = template;
    payload.basic_model_name = basicName;
    payload.cloze_model_name = clozeName;
    payload.input_model_name = inputName;
    payload["font-size"] = fontSize;

    let settings = { object_id: pageId, payload };
    await backend
      .saveSettings(settings)
      .then(() => {
        onClickClose(event);
      })
      .catch((error) => {
        console.error(error);
      });

    console.log(payload);
  };
  return (
    <div className={`modal ${isActive ? "is-active" : ""}`}>
      <div className="modal-background"></div>
      <div className="modal-card">
        {loading && <div className="loader is-loading"></div>}
        {!loading && (
          <>
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
                    You can use this to change the default name which comes from
                    the Notion page. If you have an existing deck in Anki you
                    want to update then you can also set the name here. It works
                    like Anki so you can create groupings (Parent::Child).
                    Please don't change the deck name if you have subpages, it's
                    more reliable to leave this empty if you have subpages.
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
                        persist(deckNameKey, newName, pageId);
                      }}
                    />
                  </div>
                </div>
                <h2 className="title is-3">Card Options</h2>
                <div className="container">
                  <BlueTintedBox>
                    <strong>Toggle Mode</strong>
                    <p className="is-size-7">
                      If you use nested toggles in your flashcards then this
                      option is useful in the case where you want to collapse
                      them so you can open them manually when you want in Anki.
                    </p>
                    <TemplateSelect
                      values={[
                        { label: "Open nested toggles", value: "open_toggle" },
                        {
                          label: "Close nested toggles",
                          value: "close_toggle",
                        },
                      ]}
                      value={toggleMode}
                      name="toggle-mode"
                      pickedTemplate={(t) => {
                        setToggleMode(t);
                        persist("toggle-mode", t, pageId);
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
                      persist("template", t, pageId);
                    }}
                  />
                  <TemplateName
                    name="basic_model_name"
                    value={basicName}
                    placeholder="Defaults to n2a-basic"
                    label="Basic Template Name"
                    pickedName={(name) => {
                      setBasicName(name);
                      persist("basic_model_name", name, pageId);
                    }}
                  />
                  <TemplateName
                    name="cloze_model_name"
                    value={clozeName}
                    placeholder="Defaults to n2a-cloze"
                    label="Cloze Template Name"
                    pickedName={(name) => {
                      setClozeName(name);
                      persist("cloze_model_name", name, pageId);
                    }}
                  />
                  <TemplateName
                    name="input_model_name"
                    value={inputName}
                    placeholder="Defaults to n2a-input"
                    label="Input Template Name"
                    pickedName={(name) => {
                      setInputName(name);
                      persist("input_model_name", name, pageId);
                    }}
                  />

                  <FontSizePicker
                    fontSize={fontSize}
                    pickedFontSize={(fs) => {
                      setFontSize(fs);
                      persist("font-size", fs.toString(), pageId);
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
              <button className="button is-link" onClick={onSubmit}>
                Save
              </button>
              <button className="button" onClick={() => resetStore()}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
