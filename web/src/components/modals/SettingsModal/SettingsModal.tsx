import { SyntheticEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ErrorHandlerType } from '../../errors/helpers/getErrorMessage';
import { getVisibleText } from '../../../lib/text/getVisibleText';
import { CardOptionsForm } from '../../CardOptionsForm/CardOptionsForm';
import sharedStyles from '../../../styles/shared.module.css';
import styles from './SettingsModal.module.css';

interface Props {
  pageTitle?: string;
  pageId: string | null;
  isActive: boolean;
  onClickClose: (event?: SyntheticEvent) => void;
  setError: ErrorHandlerType;
}

function SettingsModal({
  pageTitle,
  pageId,
  isActive,
  onClickClose,
  setError,
}: Readonly<Props>) {
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  const params = new URLSearchParams();
  if (pageId) params.set('pageId', pageId);
  if (pageTitle) params.set('title', pageTitle);
  params.set('returnTo', returnTo);
  const fullPageHref = `/settings/card-options?${params.toString()}`;

  return (
    <div className={isActive ? sharedStyles.modal : sharedStyles.modalHidden}>
      <button
        type="button"
        className={sharedStyles.modalBackdrop}
        onClick={onClickClose}
        aria-label="Close modal"
      />
      <div className={sharedStyles.modalCard}>
        <div className={sharedStyles.modalHeader}>
          <div className={sharedStyles.modalHeaderTitle}>
            {getVisibleText('card.options')}
          </div>
          <div className={styles.headerActions}>
            <Link to={fullPageHref} className={styles.openFullPage}>
              Open full page ↗
            </Link>
            <button
              type="button"
              aria-label="close"
              onClick={onClickClose}
              className={sharedStyles.modalClose}
            >
              &times;
            </button>
          </div>
        </div>
        <section className={sharedStyles.modalBody}>
          <CardOptionsForm
            pageTitle={pageTitle}
            pageId={pageId}
            onSaved={onClickClose}
            onReset={() => onClickClose()}
            setError={setError}
          />
        </section>
      </div>
    </div>
  );
}

SettingsModal.defaultProps = {
  pageTitle: null,
};

export default SettingsModal;
