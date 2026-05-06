import { useState } from 'react';
import { Link } from 'react-router-dom';

import useQuery from '../../lib/hooks/useQuery';
import WarningMessage from '../../components/WarningMessage';
import UploadForm from './components/UploadForm/UploadForm';
import SettingsIcon from '../../components/icons/SettingsIcon';
import SettingsModal from '../../components/modals/SettingsModal/SettingsModal';
import styles from '../../styles/shared.module.css';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { getVisibleText } from '../../lib/text/getVisibleText';
import getAcceptedContentTypes from './helpers/getAcceptedContentTypes';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export function UploadPage({ setErrorMessage }: Props) {
  const isDevelopment = !window.location.host.match(/2anki.(com|net|de)/);
  const query = useQuery();
  const view = query.get('view');

  const forceCardOptionsOpen =
    view === 'template' || view === 'deck-options' || view === 'card-options';
  const [showCardOptionsModal, setShowCardOptionsModal] = useState(
    forceCardOptionsOpen
  );
  const [fileInteracted, setFileInteracted] = useState(forceCardOptionsOpen);

  const readableSupportedFiles = getAcceptedContentTypes()
    .split(',')
    .map((type, index, array) => {
      if (index === array.length - 1) return `and ${type}`;
      return type;
    })
    .join(', ');

  return (
    <div className={styles.page}>
      {isDevelopment ? <WarningMessage /> : null}
      <header className={`${styles.pageHeader} ${styles.flexBetween}`}>
        <h1 className={styles.title}>{getVisibleText('upload.page.title')}</h1>
        {fileInteracted && (
          <Link
            className={styles.secondaryText}
            to="?view=template"
            onClick={() => setShowCardOptionsModal(true)}
            aria-label="Card and deck options"
          >
            <SettingsIcon />
          </Link>
        )}
      </header>
      <UploadForm
        setErrorMessage={setErrorMessage}
        onFileSelected={() => setFileInteracted(true)}
      />
      <p>The following files are supported: {readableSupportedFiles}</p>
      <p className={styles.smallDescription}>
        All files uploaded here are automatically deleted after 2 hours.
      </p>
      <SettingsModal
        setError={setErrorMessage}
        pageId={null}
        isActive={showCardOptionsModal}
        onClickClose={() => {
          window.history.pushState({}, '', 'upload');
          setShowCardOptionsModal(false);
        }}
      />
    </div>
  );
}
