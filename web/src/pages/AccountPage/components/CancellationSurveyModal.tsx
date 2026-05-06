import { useState } from 'react';
import { CancelMode } from '../../../lib/backend/cancelSubscription';
import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AccountPage.module.css';

export const CANCELLATION_REASONS = [
  'I finished what I needed',
  "I don't use it enough",
  'Too expensive',
  'I found an alternative',
  'Technical issues',
  'Other',
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

interface Props {
  readonly mode: CancelMode;
  readonly onConfirm: (reason: CancellationReason, comment: string) => void;
  readonly onClose: () => void;
}

const MODE_LABELS: Record<CancelMode, string> = {
  period_end: 'Cancel at end of billing period',
  immediate: 'Cancel immediately',
};

export function CancellationSurveyModal({ mode, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState<CancellationReason | ''>('');
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm(reason, comment.trim());
  };

  return (
    <div className={sharedStyles.modal}>
      <button
        type="button"
        className={sharedStyles.modalBackdrop}
        onClick={onClose}
        aria-label="Close"
      />
      <div className={sharedStyles.modalCardNarrow}>
        <div className={sharedStyles.modalHeader}>
          <span className={sharedStyles.modalHeaderTitle}>
            Before you go…
          </span>
          <button
            type="button"
            className={sharedStyles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className={sharedStyles.modalBody}>
          <p>Why are you cancelling? (required)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CANCELLATION_REASONS.map((r) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cancellation-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                />
                {r}
              </label>
            ))}
          </div>

          {reason === 'Other' && (
            <textarea
              placeholder="Tell us more (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              style={{ width: '100%', resize: 'vertical', padding: '0.5rem', boxSizing: 'border-box' }}
            />
          )}
        </div>

        <div className={sharedStyles.modalFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Keep subscription
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={handleConfirm}
            disabled={!reason}
          >
            {MODE_LABELS[mode]}
          </button>
        </div>
      </div>
    </div>
  );
}
