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

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export function UploadPage({ setErrorMessage }: Readonly<Props>) {
  const isDevelopment = !/2anki\.(com|net|de)/.exec(globalThis.location.host);
  const query = useQuery();
  const view = query.get('view');

  const forceCardOptionsOpen =
    view === 'template' || view === 'deck-options' || view === 'card-options';
  const [showCardOptionsModal, setShowCardOptionsModal] = useState(
    forceCardOptionsOpen
  );
  const [fileInteracted, setFileInteracted] = useState(forceCardOptionsOpen);

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
      <p className={styles.smallDescription}>
        Supports .zip, .html, .csv, .md, .pdf, .ppt, .pptx, .xlsx, .doc,
        and .docx files.
      </p>
      <p className={styles.smallDescription}>
        Coming from Notion?{' '}
        <a href="/documentation/start-here/upload-a-file">
          Learn how to export your pages.
        </a>
      </p>
      <p className={styles.smallDescription}>
        Uploaded files are automatically deleted after 2 hours.
      </p>
      <SettingsModal
        setError={setErrorMessage}
        pageId={null}
        isActive={showCardOptionsModal}
        onClickClose={() => {
          globalThis.history.pushState({}, '', 'upload');
          setShowCardOptionsModal(false);
        }}
      />
    </div>
  );
}
