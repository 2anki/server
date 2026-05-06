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
    <div>
      <label htmlFor={name}>
        {label}
        <div>
          <input
            type="text"
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
