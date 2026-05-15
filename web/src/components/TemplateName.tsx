import sharedStyles from '../styles/shared.module.css';
import { FieldHint } from './FieldHint';

interface TemplateNameDelegate {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  pickedName: (name: string) => void;
  hint?: string;
}

function TemplateName({
  label,
  placeholder,
  name,
  value,
  pickedName,
  hint,
}: Readonly<TemplateNameDelegate>) {
  return (
    <div>
      <div className={sharedStyles.fieldHeader}>
        <label htmlFor={name} className={sharedStyles.fieldLabel}>
          {label}
        </label>
        {hint && <FieldHint text={hint} />}
      </div>
      <input
        id={name}
        type="text"
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={(event) => pickedName(event.target.value)}
      />
    </div>
  );
}

export default TemplateName;
