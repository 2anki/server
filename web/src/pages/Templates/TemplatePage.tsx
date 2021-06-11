import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MonacoEditor from "react-monaco-editor";
import TemplateSelect from "../../components/TemplateSelect";
import TemplateFile from "../../model/TemplateFile";

// Don't put in the render function, it gets recreated
let files: TemplateFile[] = [];

async function fetchBaseType(name: string) {
  let url = `/templates/${name}.json`;
  const request = await window.fetch(url);
  const response = await request.json();
  return response;
}

const TemplatePage = () => {
  const [code, setCode] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [options, _setOptions] = useState({
    minimap: { enabled: false },
    colorDecorators: false,
  });
  const [isFront, setIsFront] = useState(true);
  const [isBack, setIsBack] = useState(false);
  const [isStyling, setIsStyling] = useState(false);
  const [language, setLanguage] = useState("html");

  const [currentCardType, setCurrentCardType] = useState(
    localStorage.getItem("current-card-type") || "n2a-basic"
  );
  const [ready, setReady] = useState(false);

  const editorDidMount = (editor: { focus: () => void }, _monaco: any) => {
    editor.focus();
  };

  const onChange = (newValue: any, event: any) => {
    const card = getCurrentCardType();
    if (card) {
      if (isFront) {
        card.front = newValue;
      } else if (isBack) {
        card.back = newValue;
      } else if (isStyling) {
        card.styling = newValue;
      }
      localStorage.setItem(card.storageKey, JSON.stringify(card, null, 2));
    }
  };

  const getCurrentCardType = useCallback(() => {
    return files.find((x) => x.storageKey === currentCardType);
  }, [currentCardType]);

  // Fetch the base presets from the server  or load from local storage (should only be called once)
  useEffect(() => {
    (async function () {
      files = [];
      for (const key of ["n2a-basic", "n2a-input", "n2a-cloze"]) {
        const local = localStorage.getItem(key);
        if (local) {
          files.push(JSON.parse(local));
        } else {
          const remote = await fetchBaseType(key);
          files.push(remote);
          localStorage.setItem(key, JSON.stringify(remote, null, 2));
        }
      }
      setReady(true);
      setLanguage("html");
      // Use the first basic front template as default file to load.
      // We might want to change this later to perserve last open file.
      setCode(files[0].front);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switching to front from back or styling
  useEffect(() => {
    if (isFront) {
      const card = getCurrentCardType();
      if (card) {
        setLanguage("html");
        setCode(card.front);
      }
      setIsStyling(false);
      setIsBack(false);
    }
  }, [isFront, currentCardType, getCurrentCardType]);

  // Switching to back from front or styling
  useEffect(() => {
    if (isBack) {
      const card = getCurrentCardType();
      if (card) {
        setCode(card.back);
        setLanguage("html");
      }
      setIsStyling(false);
      setIsFront(false);
    }
  }, [getCurrentCardType, isBack]);

  useEffect(() => {
    if (isStyling) {
      setIsStyling(isStyling);
      setIsFront(false);
      setIsBack(false);
      const c = getCurrentCardType();
      if (c) {
        setCode(c.styling);
        setLanguage("css");
      }
    }
  }, [getCurrentCardType, isStyling]);

  return (
    <section className="section mt4">
      <div className="container">
        {!ready && <p>Loading....</p>}
        {ready && (
          <>
            <p className="title">Template Manager</p>
            <p className="subtitle">
              No saving required, everything is saved instantly! You can always
              revert the template changes in the{" "}
              <Link to="/upload?view=template">settings</Link>. Adding /
              removing fields and preview is coming soon.
            </p>
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Template: </label>
              </div>
              <div className="field-body">
                <div className="field">
                  <TemplateSelect
                    values={files.map((f) => {
                      return { label: f.name, value: f.name };
                    })}
                    value={currentCardType}
                    name="current-card-type"
                    pickedTemplate={(t) => {
                      setIsFront(true);
                      setCurrentCardType(t);
                    }}
                  />
                </div>
              </div>
            </div>
            <p>Template</p>
            <div className="control m-2">
              <label className="radio">
                <input
                  checked={isFront}
                  onChange={(event) => setIsFront(event.target.checked)}
                  className="m-2"
                  type="radio"
                  name="front-template"
                />
                Front Template
              </label>
              <label className="radio">
                <input
                  checked={isBack}
                  onChange={(event) => setIsBack(event.target.checked)}
                  className="m-2"
                  type="radio"
                  name="back-template"
                />
                Back Template
              </label>
              <label className="radio">
                <input
                  checked={isStyling}
                  onChange={(event) => setIsStyling(event.target.checked)}
                  className="m-2"
                  type="radio"
                  name="styling"
                />
                Styling
              </label>
            </div>
            <MonacoEditor
              height="512px"
              language={language}
              theme="vs-dark"
              value={code}
              options={options}
              onChange={onChange}
              editorDidMount={editorDidMount}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default TemplatePage;
