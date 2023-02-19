interface TemplateNameDelegate {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  pickedName: (name: string) => void;
}

function TemplateName({
  label,
  placeholder,
  name,
  value,
  pickedName,
}: TemplateNameDelegate) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        <div className="control">
          <input
            type="text"
            className="input"
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={(event) => pickedName(event.target.value)}
          />
        </div>
      </label>
    </div>
  );
}

export default TemplateName;
