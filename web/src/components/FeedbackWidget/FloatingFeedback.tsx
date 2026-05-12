import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import ChatBubbleIcon from '../icons/ChatBubbleIcon';
import { FeedbackWidget } from './FeedbackWidget';
import styles from './FloatingFeedback.module.css';

export function FloatingFeedback() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return createPortal(
    <div className={styles.container}>
      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Send feedback</span>
            <button
              type="button"
              className={styles.panelClose}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <FeedbackWidget
            page={pathname}
            onSubmitted={() => setTimeout(() => setOpen(false), 1500)}
          />
        </div>
      )}
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close feedback' : 'Send feedback'}
      >
        <ChatBubbleIcon width={22} height={22} />
      </button>
    </div>,
    document.body
  );
}
