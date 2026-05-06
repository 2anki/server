import styles from './StepIndicator.module.css';
import { StepIndex } from './jobStepFromStatus';

interface Props {
  readonly currentStep: StepIndex;
  readonly substep?: string;
}

const STEP_LABELS = ['Uploaded', 'Parsing', 'Generating', 'Packaging'] as const;

function getPillClass(step: StepIndex, currentStep: StepIndex): string {
  if (step < currentStep) return styles.pillDone;
  if (step === currentStep) return styles.pillActive;
  return styles.pillPending;
}

export function StepIndicator({ currentStep, substep }: Props) {
  return (
    <ol className={styles.indicator} aria-label="Conversion progress">
      {STEP_LABELS.map((label, index) => {
        const step = (index + 1) as StepIndex;
        const isActive = step === currentStep;
        return (
          <li
            key={label}
            className={`${styles.pill} ${getPillClass(step, currentStep)}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className={styles.dot} />
            {label}
            {isActive && substep && (
              <span className={styles.substep}>({substep})</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
