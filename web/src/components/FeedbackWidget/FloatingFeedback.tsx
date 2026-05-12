import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { FeedbackWidget } from './FeedbackWidget';
import styles from './FloatingFeedback.module.css';

export function FloatingFeedback() {
  const { pathname } = useLocation();

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
