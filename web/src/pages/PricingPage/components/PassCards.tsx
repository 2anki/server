import { PricingCard } from './PricingCard';
import styles from '../PricingPage.module.css';

const PASS_BENEFITS = [
  'Unlimited conversions',
  'All upload formats — Notion, .zip, .html, .md, .csv, .apkg',
  'Image occlusion',
  'Custom card templates',
];

interface PassCardsProps {
  onDayPass: () => void;
  onWeekPass: () => void;
  dayPassPending: boolean;
  weekPassPending: boolean;
}

export function PassCards({
  onDayPass,
  onWeekPass,
  dayPassPending,
  weekPassPending,
}: Readonly<PassCardsProps>) {
  return (
    <div className={styles.passRow}>
      <span className={styles.passRowLabel}>Need just a weekend?</span>
      <span className={styles.passRowItems}>
        <details className={styles.passAccordion}>
          <summary className={styles.passAccordionSummary}>Day Pass $4</summary>
          <div className={styles.passAccordionBody}>
            <PricingCard
              title="Day Pass"
              badge="Pay once"
              badgeMuted
              price="$4"
              priceSuffix="— 24 hours"
              benefits={PASS_BENEFITS}
              onAction={onDayPass}
              actionLabel={dayPassPending ? 'Redirecting…' : 'Get Day Pass'}
              actionDisabled={dayPassPending}
            />
          </div>
        </details>
        <span className={styles.passRowDot} aria-hidden="true">·</span>
        <details className={styles.passAccordion}>
          <summary className={styles.passAccordionSummary}>Week Pass $9</summary>
          <div className={styles.passAccordionBody}>
            <PricingCard
              title="Week Pass"
              badge="Pay once"
              badgeMuted
              price="$9"
              priceSuffix="— 1 week"
              benefits={PASS_BENEFITS}
              onAction={onWeekPass}
              actionLabel={weekPassPending ? 'Redirecting…' : 'Get Week Pass'}
              actionDisabled={weekPassPending}
            />
          </div>
        </details>
        <span className={styles.passRowDot} aria-hidden="true">·</span>
        <span className={styles.passRowLifetime}>Lifetime from $345</span>
      </span>
    </div>
  );
}
