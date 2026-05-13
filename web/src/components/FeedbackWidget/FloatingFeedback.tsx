import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { FeedbackWidget } from './FeedbackWidget';
import styles from './FloatingFeedback.module.css';

const HIDDEN_PATHS = new Set(['/whats-new', '/feedback']);
const HIDDEN_PREFIXES = ['/rules/'];
const DISMISSED_KEY = '2anki_feedback_dismissed';

function shouldHide(pathname: string): boolean {
  if (HIDDEN_PATHS.has(pathname)) return true;
  return HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
}

export function FloatingFeedback() {
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === '1'
  );

  if (dismissed) return null;
  if (shouldHide(pathname)) return null;

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
