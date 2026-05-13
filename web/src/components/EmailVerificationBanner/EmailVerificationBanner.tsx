import { useState, useEffect } from 'react';
import styles from './EmailVerificationBanner.module.css';

const STORAGE_KEY = 'email_verification_pending';

export function EmailVerificationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const pending = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    if (pending === 'true') {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    globalThis.sessionStorage?.removeItem(STORAGE_KEY);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <output className={styles.banner}>
      <span>Check your inbox to verify your email.</span>
      <button type="button" onClick={dismiss} className={styles.dismiss} aria-label="Dismiss">
        &#x2715;
      </button>
    </output>
  );
}
