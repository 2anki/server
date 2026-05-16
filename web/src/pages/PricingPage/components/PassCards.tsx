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

function PassPickerHelper() {
  return (
    <div className={styles.passPickerHelper}>
      <p className={styles.passPickerTitle}>Pick your pass</p>
      <p className={styles.passPickerHint}>
        Have a deadline this weekend? Day Pass. Studying through the week? Week Pass.
      </p>
    </div>
  );
}

export function PassCards({
  onDayPass,
  onWeekPass,
  dayPassPending,
  weekPassPending,
}: Readonly<PassCardsProps>) {
  return (
    <div className={styles.passSection}>
      <PassPickerHelper />
      <div className={styles.passGrid}>
        <PricingCard
          title="Day Pass"
          badge="Pay once"
          badgeMuted
          price="$4"
          priceSuffix="— 24 hours"
          benefits={PASS_BENEFITS}
          onAction={onDayPass}
          actionLabel={dayPassPending ? 'Redirecting…' : 'Get Day Pass'}
          actionDisabled={dayPassPending || weekPassPending}
          caption="Starts the moment you pay"
        />
        <PricingCard
          title="Week Pass"
          badge="Pay once"
          badgeMuted
          price="$9"
          priceSuffix="— 1 week"
          benefits={PASS_BENEFITS}
          onAction={onWeekPass}
          actionLabel={weekPassPending ? 'Redirecting…' : 'Get Week Pass'}
          actionDisabled={dayPassPending || weekPassPending}
          caption="Starts the moment you pay"
        />
      </div>
    </div>
  );
}
