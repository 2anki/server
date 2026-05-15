import sharedStyles from '../../styles/shared.module.css';
import { NoteTypeOption } from './useAvailableNoteTypes';

interface NoteTypePickerProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  options: NoteTypeOption[];
  loading: boolean;
  onChange: (value: string) => void;
}

export function NoteTypePicker({
  label,
  name,
  value,
  placeholder,
  options,
  loading,
  onChange,
}: Readonly<NoteTypePickerProps>) {
  const selectedIsCustom =
    value.length > 0 && !options.some((option) => option.value === value);

  const groupedByOrigin = {
    user: options.filter((o) => o.origin === 'user'),
    official: options.filter((o) => o.origin === 'official'),
    starter: options.filter((o) => o.origin === 'starter'),
  };

  return (
    <div>
      <label htmlFor={name}>
        {label}
        <div>
          <select
            id={name}
            name={name}
            className={sharedStyles.select}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={loading}
          >
            <option value="">{placeholder}</option>
            {groupedByOrigin.user.length > 0 && (
              <optgroup label="Your note types">
                {groupedByOrigin.user.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            )}
            {groupedByOrigin.official.length > 0 && (
              <optgroup label="Official 2anki templates">
                {groupedByOrigin.official.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            )}
            {groupedByOrigin.starter.length > 0 && (
              <optgroup label="Starter note types">
                {groupedByOrigin.starter.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            )}
            {selectedIsCustom && (
              <option value={value}>{value} (custom)</option>
            )}
          </select>
        </div>
      </label>
    </div>
  );
}

export default NoteTypePicker;
