import {
  Section,
  Title,
  Subtitle,
  Container,
  Button,
  Columns,
  Column,
} from "trunx";
import MonacoEditor from "react-monaco-editor";
import { useState } from "react";

interface TemplateField {
  name: string;
  position: number;
  font: string;
  rtl: string;
  size: number;
  sticky: boolean;
  sortField: number; // is this correct?
}

interface TemplateFile {
  parent: string;
  name: string;
  front: string;
  back: string;
  styling: string;
  storageKey: string;
}

let files = [
  { parent: "Basic", name: "n2a-basic" },
  { parent: "Cloze", name: "n2a-cloze" },
  { parent: "Basic (type in the answer)", name: "n2a-input" },
];

const TemplatePage = () => {
  const [code, setCode] = useState("");
  const [options, setOptions] = useState({});

  const editorDidMount = (editor: { focus: () => void }, _monaco: any) => {
    editor.focus();
  };

  const onChange = (newValue: any, event: any) => {
    console.log("newValue", newValue, event);
  };

  const saveChanges = () => {
    console.log("TODO save");
  };

  return (
    <Section m4>
      <Container>
        <Title>Template Manager</Title>
        <Subtitle hasTextDanger>This is a work in progress.</Subtitle>
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Card Type: </label>
          </div>
          <div className="field-body">
            <div className="field">
              <p className="control">
                <div className="select">
                  <select>
                    {files.map((f) => (
                      <option>{f.name}</option>
                    ))}
                  </select>
                </div>
              </p>
            </div>
          </div>
        </div>
        <Columns>
          <Column>
            <p>Template</p>
            <div className="control m-2">
              <label className="radio">
                <input className="m-2" type="radio" name="answer" />
                Front Template
              </label>
              <label className="radio">
                <input className="m-2" type="radio" name="answer" />
                Back Template
              </label>
              <label className="radio">
                <input className="m-2" type="radio" name="answer" />
                Styling
              </label>
            </div>
            <MonacoEditor
              width="540px"
              height="600"
              language="javascript"
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
                <input className="m-2" type="radio" name="answer" />
                Front Preview
              </label>
              <label className="radio">
                <input className="m-2" type="radio" name="answer" />
                Back Preview
              </label>
              <div
                className="mt-2"
                style={{
                  height: "600px",
                  width: "540px",
                  border: "1.3px solid grey",
                }}
              ></div>
            </div>
          </Column>
        </Columns>
        <Container hasTextCentered mt2>
          <Button isPrimary onClick={saveChanges}>
            Save
          </Button>
        </Container>
      </Container>
    </Section>
  );
};

export default TemplatePage;
