import TemplateName from "./TemplateName";
import TemplateSelect from "./TemplateSelect";
import FontSizePicker from "./FontSizePicker";
import BlueTintedBox from "./BlueTintedBox";

const TemplateOptions = () => {
  return (
    <div className="container">
      <div className="has-text-centered">
        <h2 className="title">Template Options</h2>
      </div>

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
    </div>
  );
};

export default TemplateOptions;
