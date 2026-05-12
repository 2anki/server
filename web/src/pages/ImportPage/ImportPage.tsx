import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import sharedStyles from '../../styles/shared.module.css';
import styles from './ImportPage.module.css';
import ApkgDropZone from './components/ApkgDropZone';
import NotionPagePicker from './components/NotionPagePicker';
import ImportProgress from './components/ImportProgress';
import useImportJob from './hooks/useImportJob';
import useNotionData from '../SearchPage/helpers/useNotionData';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';

interface ImportPageProps {
  setError: (error: unknown) => void;
}

export default function ImportPage({ setError }: Readonly<ImportPageProps>) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPageTitle, setSelectedPageTitle] = useState<string>('');
  const notionData = useNotionData(get2ankiApi());
  const job = useImportJob();

  const isConnected = notionData.connected === true;
  const isIdle = job.phase === 'idle';
  const isUploading = job.phase === 'uploading';
  const isPolling = job.phase === 'polling';
  const isCompleted = job.phase === 'completed';
  const isFailed = job.phase === 'failed';
  const isRunning = isUploading || isPolling;

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    setFileError(null);
  }, []);

  const handleFileRejected = useCallback((message: string) => {
    setFileError(message);
  }, []);

  const handlePageSelected = useCallback((pageId: string, pageTitle: string) => {
    setSelectedPageId(pageId);
    setSelectedPageTitle(pageTitle);
  }, []);

  const handleStartImport = useCallback(async () => {
    if (file == null || selectedPageId == null) return;
    try {
      await job.submit(file, selectedPageId);
    } catch (err) {
      setError(err);
    }
  }, [file, selectedPageId, job, setError]);

  const handleReset = useCallback(() => {
    job.reset();
    setFile(null);
    setFileError(null);
    setSelectedPageId(null);
    setSelectedPageTitle('');
  }, [job]);

  if (notionData.loading) {
    return (
      <div className={sharedStyles.page}>
        <div className={sharedStyles.flexCenter}>
          <div className={sharedStyles.spinnerSmall} />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={sharedStyles.page}>
        <div className={sharedStyles.pageHeader}>
          <h1 className={sharedStyles.title}>Connect Notion to import cards</h1>
          <p className={sharedStyles.subtitle}>
            To import an Anki deck into Notion, we need access to your workspace.
          </p>
        </div>
        <div className={styles.connectContainer}>
          <a href="/notion" className={sharedStyles.btnPrimary}>
            Connect to Notion
          </a>
          <p className={styles.connectPrivacy}>
            We only create pages where you choose. We don't read or change your
            existing Notion content.
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className={sharedStyles.page}>
        <div className={styles.completeContainer}>
          <h2 className={styles.completeTitle}>Import complete</h2>
          <p className={styles.completeSummary}>
            {job.progress.imported} cards added to &ldquo;{selectedPageTitle}&rdquo;
          </p>
          <div className={styles.completeActions}>
            {job.notionPageUrl && (
              <a
                href={job.notionPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={sharedStyles.btnPrimary}
              >
                Open in Notion
              </a>
            )}
            <button
              type="button"
              className={sharedStyles.btnSecondary}
              onClick={handleReset}
            >
              Import another deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className={sharedStyles.page}>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Import stopped</h2>
          <p className={styles.errorBody}>
            {job.progress.total_notes > 0
              ? `We got through ${job.progress.imported} of ${job.progress.total_notes} cards, then something went wrong. The cards we already created are still in your Notion page.`
              : job.errorMessage ?? 'Something went wrong.'}
          </p>
          <div className={styles.errorActions}>
            <button
              type="button"
              className={sharedStyles.btnPrimary}
              onClick={handleReset}
            >
              Try again
            </button>
            <Link to="/contact" className={sharedStyles.btnSecondary}>
              Contact support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className={sharedStyles.page}>
        <ImportProgress
          imported={job.progress.imported}
          total={job.progress.total_notes}
          fileName={file?.name ?? ''}
          pageTitle={selectedPageTitle}
        />
      </div>
    );
  }

  return (
    <div className={sharedStyles.page}>
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>Import to Notion</h1>
        <p className={sharedStyles.subtitle}>
          Turn an Anki deck into Notion toggle pages.
        </p>
      </div>

      <div className={styles.stepSection}>
        <div className={styles.stepLabel}>Step 1</div>
        <ApkgDropZone
          file={file}
          onFileSelected={handleFileSelected}
          onFileRejected={handleFileRejected}
          disabled={isRunning}
        />
        {fileError && <p className={styles.dropZoneError}>{fileError}</p>}
      </div>

      <div className={`${styles.stepSection} ${file == null ? styles.stepDisabled : ''}`}>
        <div className={styles.stepLabel}>Step 2 — Choose where to put the cards</div>
        <NotionPagePicker
          selectedPageId={selectedPageId}
          onPageSelected={handlePageSelected}
          disabled={file == null || isRunning}
        />
        <p className={styles.pagePickerHelp}>
          Showing top-level pages shared with 2anki. Missing a page? Check your
          Notion sharing settings.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={sharedStyles.btnPrimary}
          disabled={file == null || selectedPageId == null || isRunning}
          onClick={handleStartImport}
        >
          Start import
        </button>
      </div>
    </div>
  );
}
