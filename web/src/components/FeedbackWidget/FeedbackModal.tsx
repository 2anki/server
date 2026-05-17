import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { useDialog } from '../../lib/hooks/useDialog';
import sharedStyles from '../../styles/shared.module.css';
import { FeedbackWidget } from './FeedbackWidget';

interface Props {
  isActive: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isActive, onClose }: Readonly<Props>) {
  const { pathname } = useLocation();
  const dialogRef = useDialog(isActive, onClose);

  return createPortal(
    <dialog
      ref={dialogRef}
      className={sharedStyles.dialog}
      aria-labelledby="feedback-modal-title"
    >
      <div className={sharedStyles.modalCardNarrow}>
        <div className={sharedStyles.modalHeader}>
          <div id="feedback-modal-title" className={sharedStyles.modalHeaderTitle}>
            Send feedback
          </div>
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
    </dialog>,
    document.body
  );
}
