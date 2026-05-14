import { FieldHint } from '../../../components/FieldHint';
import sharedStyles from '../../../styles/shared.module.css';
import FlashcardType from './FlashcardType';
import styles from './Rules.module.css';

interface RuleDefinitionProps {
  title: string;
  hint: string;
  options: string[];
  value: string[];
  onSelected: (value: string) => void;
}

export default function RuleDefinition({
  title,
  hint,
  options,
  value,
  onSelected,
}: Readonly<RuleDefinitionProps>) {
  return (
    <>
      <div className={styles.groupHeader}>
        <h2 className={styles.groupHeading}>{title}</h2>
        <FieldHint text={hint} />
      </div>
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
    </>
  );
}
