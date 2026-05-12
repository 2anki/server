import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { FeedbackWidget } from './FeedbackWidget';
import styles from './FloatingFeedback.module.css';

const PAGES_WITH_OWN_FEEDBACK = new Set(['/whats-new']);

export function FloatingFeedback() {
  const { pathname } = useLocation();

  if (PAGES_WITH_OWN_FEEDBACK.has(pathname)) return null;

  return createPortal(
    <div className={styles.container}>
      <div className={styles.panel}>
        <p className={styles.panelTitle}>How's your experience?</p>
        <FeedbackWidget page={pathname} compact />
      </div>
    </div>,
    document.body
  );
}
