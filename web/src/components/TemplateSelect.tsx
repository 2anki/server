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

const TemplateSelect = (delegate: TemplateSelectPicker) => {
  return (
    <div className="field">
      <div className="control">
        <div className="select">
          <select
            name={delegate.name}
            value={delegate.value}
            onChange={(event) => delegate.pickedTemplate(event.target.value)}
          >
            {delegate.values.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelect;
