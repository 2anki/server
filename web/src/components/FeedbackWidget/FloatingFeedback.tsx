import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { FeedbackWidget } from './FeedbackWidget';
import styles from './FloatingFeedback.module.css';

const PAGES_WITH_OWN_FEEDBACK = new Set(['/whats-new']);
const DISMISSED_KEY = '2anki_feedback_dismissed';

export function FloatingFeedback() {
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === '1'
  );

  if (dismissed) return null;
  if (PAGES_WITH_OWN_FEEDBACK.has(pathname)) return null;

  const handleSubmitted = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return createPortal(
    <div className={styles.container}>
      <div className={styles.panel}>
        <p className={styles.panelTitle}>How's your experience?</p>
        <FeedbackWidget page={pathname} compact onSubmitted={handleSubmitted} />
      </div>
    </div>,
    document.body
  );
}
