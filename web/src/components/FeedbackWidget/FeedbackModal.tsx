import { useLocation } from 'react-router-dom';

import sharedStyles from '../../styles/shared.module.css';
import { FeedbackWidget } from './FeedbackWidget';

interface Props {
  isActive: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isActive, onClose }: Readonly<Props>) {
  const { pathname } = useLocation();

  return (
    <div className={isActive ? sharedStyles.modal : sharedStyles.modalHidden}>
      <button
        type="button"
        className={sharedStyles.modalBackdrop}
        onClick={onClose}
        aria-label="Close feedback"
      />
      <div className={sharedStyles.modalCardNarrow}>
        <div className={sharedStyles.modalHeader}>
          <div className={sharedStyles.modalHeaderTitle}>Send feedback</div>
          <button
            type="button"
            aria-label="close"
            onClick={onClose}
            className={sharedStyles.modalClose}
          >
            &times;
          </button>
        </div>
        <section className={sharedStyles.modalBody}>
          <FeedbackWidget page={pathname} onSubmitted={onClose} />
        </section>
      </div>
    </div>
  );
}
