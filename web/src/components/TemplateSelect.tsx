interface SelectOption {
  value: string;
  label: string;
}

interface TemplateSelectPicker {
  pickedTemplate: (name: string) => void;
  values: SelectOption[];
  name: string;
  value: string;
}

function TemplateSelect({
  name,
  value,
  pickedTemplate,
  values,
}: TemplateSelectPicker) {
  return (
    <div className="field">
      <div className="control">
        <div className="select">
          <select
            name={name}
            value={value}
            onChange={(event) => pickedTemplate(event.target.value)}
          >
            {values.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelect;
