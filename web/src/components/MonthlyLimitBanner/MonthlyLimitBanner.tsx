import { Link } from 'react-router-dom';
import styles from './MonthlyLimitBanner.module.css';

const ENFORCE_AFTER = new Date(Date.UTC(2026, 5, 1));

interface MonthlyLimitBannerProps {
  isPaying: boolean;
  now?: Date;
}

export function MonthlyLimitBanner({
  isPaying,
  now = new Date(),
}: Readonly<MonthlyLimitBannerProps>) {
  if (isPaying) return null;
  if (now >= ENFORCE_AFTER) return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.message}>
        Free plan: 100 cards per month, starting 1 June.
      </span>
      <Link to="/pricing?from=banner" className={styles.link}>
        See plans
      </Link>
    </div>
  );
}
