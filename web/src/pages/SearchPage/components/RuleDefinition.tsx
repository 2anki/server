import FlashcardType from './FlashcardType';
import styles from '../../../styles/shared.module.css';
import rulesStyles from './Rules.module.css';

interface RuleDefinitionProps {
  description: string;
  title: string;
  options: string[];
  value: string[];
  onSelected: (value: string) => void;
}

export default function RuleDefinition({
  title,
  options,
  value,
  onSelected,
  description,
}: Readonly<RuleDefinitionProps>) {
  return (
    <details className={rulesStyles.details} open>
      <summary>{title}</summary>
      <p className={styles.smallDescription}>{description}</p>
      <div className={styles.flexWrap}>
        {options.map((fco) => (
          <FlashcardType
            key={fco}
            active={value.includes(fco)}
            name={fco}
            onSwitch={(name) => onSelected(name)}
          />
        ))}
      </div>
    </details>
  );
}
