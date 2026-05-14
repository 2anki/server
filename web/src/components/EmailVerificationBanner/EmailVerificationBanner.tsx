import { useState } from 'react';
import styles from './EmailVerificationBanner.module.css';

type ResendState = 'idle' | 'sending' | 'sent' | 'rate-limited';

interface Props {
  emailVerified: boolean;
  email: string;
  onResend: () => Promise<void>;
}

export function EmailVerificationBanner({ emailVerified, email, onResend }: Readonly<Props>) {
  const [resendState, setResendState] = useState<ResendState>('idle');
  const [dismissed, setDismissed] = useState(false);

  if (emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setResendState('sending');
    try {
      await onResend();
      setResendState('sent');
      setTimeout(() => setResendState('idle'), 60_000);
    } catch {
      setResendState('rate-limited');
      setTimeout(() => setResendState('idle'), 60_000);
    }
  };

  const resendLabel: Record<ResendState, string> = {
    idle: 'Resend email',
    sending: 'Sending…',
    sent: 'Sent — check your inbox',
    'rate-limited': 'Try again in a minute',
  };

  return (
    <div className={styles.banner} role="status">
      <div className={styles.text}>
        <span>Verify your email so you can recover your account.</span>
        <span className={styles.sub}>We sent a link to {email}.</span>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.resend}
          onClick={handleResend}
          disabled={resendState !== 'idle'}
        >
          {resendLabel[resendState]}
        </button>
        {resendState !== 'idle' && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={styles.dismiss}
            aria-label="Dismiss"
          >
            &#x2715;
          </button>
        )}
      </div>
    </div>
  );
}
