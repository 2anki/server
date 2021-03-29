import TemplateName from "./TemplateName";

const TemplateOptions = () => {
  return (
    <div className="container">
      <div className="has-text-centered">
        <h2 className="title">Template Options</h2>
      </div>

      <div className="box">
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
      </div>
    </div>
  );
};

export default TemplateOptions;
