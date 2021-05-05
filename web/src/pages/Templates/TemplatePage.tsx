import { Section, Title, Subtitle, Container, Columns, Column } from "trunx";
import MonacoEditor from "react-monaco-editor";
import { useCallback, useEffect, useState } from "react";
import TemplateSelect from "../../components/TemplateSelect";

interface TemplateFile {
  parent: string;
  name: string;
  front: string;
  back: string;
  styling: string;
  storageKey: string;
}

let files: TemplateFile[] = [];

async function fetchBaseType(name: string) {
  let url = `/templates/${name}.json`;
  const request = await window.fetch(url);
  const response = await request.json();
  return response;
}

const TemplatePage = () => {
  const [code, setCode] = useState("");
  const [options, _setOptions] = useState({
    colorDecorators: false,
  });
  const [isFront, setIsFront] = useState(true);
  const [isBack, setIsBack] = useState(false);
  const [isStyling, setIsStyling] = useState(false);
  const [language, setLanguage] = useState("html");

  const [currentCardType, setCurrentCardType] = useState(
    localStorage.getItem("current-card-type") || "n2a-basic"
  );
  const [isFrontPreview, setIsFrontPreview] = useState(true);
  const [isBackPreview, setIsBackPreview] = useState(false);
  const [ready, setReady] = useState(false);

  const getPreviewStyle = () => {
    const c = getCurrentCardType();
    if (c) {
      return c.styling;
    }
    return "";
  };

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

  const getPreviewContent = useCallback(() => {
    console.log("1x");
    const c = getCurrentCardType();
    if (c) {
      if (isFront || isFrontPreview) {
        return c.front;
      } else if (isBack || isBackPreview) {
        return c.back;
      }
    }
    return "<p>Error with preview</p>";
  }, [getCurrentCardType, isFront, isFrontPreview, isBack, isBackPreview]);

  // Fetch the base presets from the server
  useEffect(() => {
    (async function () {
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
  }, []);

  useEffect(() => {
    if (isFront) {
      const c = getCurrentCardType();
      if (c) {
        setLanguage("html");
        setCode(c.front);
      }
      setIsFrontPreview(isFront);
      setIsBackPreview(false);
      setIsStyling(false);
      setIsBack(false);
    }
  }, [isFront, currentCardType, getCurrentCardType]);

  useEffect(() => {
    if (isBack) {
      const c = getCurrentCardType();
      if (c) {
        setCode(c.back);
        setLanguage("html");
      }
      setIsBackPreview(isBack);
      setIsFrontPreview(false);
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

  useEffect(() => {
    if (isBackPreview) {
      setIsFrontPreview(false);
      setIsFront(false);
      setIsBack(true);
    }
  }, [isBackPreview]);

  useEffect(() => {
    if (isFrontPreview) {
      setIsBackPreview(false);
      setIsBack(false);
      setIsFront(true);
    }
  }, [isFrontPreview]);

  return (
    <Section m4>
      <Container>
        {!ready && <p>Loading....</p>}
        {ready && (
          <>
            <Title>Template Manager</Title>
            <Subtitle hasTextDanger>This is a work in progress.</Subtitle>
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Card Type: </label>
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
            <Columns>
              <Column>
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
                  width="540px"
                  height="600"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  options={options}
                  onChange={onChange}
                  editorDidMount={editorDidMount}
                />
              </Column>
              <Column>
                <p>Preview</p>
                <div className="control m-2">
                  <label className="radio">
                    <input
                      checked={isFrontPreview}
                      onChange={(event) =>
                        setIsFrontPreview(event?.target.checked)
                      }
                      className="m-2"
                      type="radio"
                      name="front-preview"
                    />
                    Front Preview
                  </label>
                  <label className="radio">
                    <input
                      checked={isBackPreview}
                      onChange={(event) =>
                        setIsBackPreview(event.target.checked)
                      }
                      className="m-2"
                      type="radio"
                      name="back-preview"
                    />
                    Back Preview
                  </label>
                  <div className="mt-2">
                    <div>
                      <iframe
                        height="600px"
                        title="preview"
                        className="toggle"
                        srcDoc={`<style scoped>${getPreviewStyle()}</style>${getPreviewContent()}`}
                      ></iframe>
                    </div>
                  </div>
                </div>
              </Column>
            </Columns>
          </>
        )}
      </Container>
    </Section>
  );
};

export default TemplatePage;
