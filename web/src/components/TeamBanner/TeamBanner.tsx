import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './TeamBanner.module.css';

const DISMISSED_KEY = '2anki_team_banner_dismissed';

export function TeamBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.label}>New</span>
        <span className={styles.text}>
          The team just grew — new features are shipping faster than ever.{' '}
          <Link to="/whats-new" className={styles.link}>
            See what's new
          </Link>
        </span>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
