import styles from '../styles/shared.module.css';

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
}

function TemplateSelect({
  name,
  value,
  pickedTemplate,
  values,
  className,
}: TemplateSelectPicker) {
  return (
    <div className={className ?? ''}>
      <select
        className={styles.select}
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
