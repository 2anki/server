import sharedStyles from '../styles/shared.module.css';
import { FieldHint } from './FieldHint';

interface SelectOption {
  value: string;
  label: string;
}

interface TemplateSelectPicker {
  pickedTemplate: (name: string) => void;
  values: SelectOption[];
  name: string;
  value: string;
  className?: string;
  label?: string;
  hint?: string;
}

function TemplateSelect({
  name,
  value,
  pickedTemplate,
  values,
  className,
  label,
  hint,
}: Readonly<TemplateSelectPicker>) {
  return (
    <div className={className ?? ''}>
      {(label || hint) && (
        <div className={sharedStyles.fieldHeader}>
          {label && (
            <label htmlFor={name} className={sharedStyles.fieldLabel}>
              {label}
            </label>
          )}
          {hint && <FieldHint text={hint} />}
        </div>
      )}
      <select
        id={name}
        className={sharedStyles.select}
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
  );
}

export default TemplateSelect;
