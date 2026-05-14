import sharedStyles from '../../../styles/shared.module.css';
import FlashcardType from './FlashcardType';

interface RuleDefinitionProps {
  options: string[];
  value: string[];
  onSelected: (value: string) => void;
}

export default function RuleDefinition({
  options,
  value,
  onSelected,
}: Readonly<RuleDefinitionProps>) {
  return (
    <div className={sharedStyles.flexWrap}>
      {options.map((fco) => (
        <FlashcardType
          key={fco}
          active={value.includes(fco)}
          name={fco}
          onSwitch={(name) => onSelected(name)}
        />
      ))}
    </div>
  );
}
