interface TemplateNameDelegate {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  pickedName: (name: string) => void;
}

const TemplateName = (delegate: TemplateNameDelegate) => {
  return (
    <div className="field">
      <label>{delegate.label}</label>
      <div className="control">
        <input
          type="text"
          className="input"
          placeholder={delegate.placeholder}
          name={delegate.name}
          value={delegate.value}
          onChange={(event) => delegate.pickedName(event.target.value)}
        />
      </div>
    </div>
  );
};

export default TemplateName;
