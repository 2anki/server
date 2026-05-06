import { useState } from 'react';
import Index from './components/ListJobs';

import useUploads from './hooks/useUploads';
import useJobs from './hooks/useJobs';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import { FinishedJobs } from './components/FinishedJobs';
import { EmptyDownloadsSection } from './components/EmptyDownloadsSection';
import { redirectOnError } from '../../components/shared/redirectOnError';
import { UnfinishedJobsInfo } from './components/UnfinishedJobsInfo';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import styles from './DownloadsPage.module.css';

interface DownloadsPageProps {
  setError: ErrorHandlerType;
}

export function DownloadsPage({ setError }: DownloadsPageProps) {
  const { deleteUpload, loading, uploads, error, refreshUploads } = useUploads(
    get2ankiApi()
  );
  const { jobs, deleteJob, restartJob, refreshJobs } = useJobs(
    get2ankiApi(),
    setError
  );
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all([refreshJobs(), refreshUploads()]);
    } finally {
      setRefreshing(false);
    }
  };
  const activeJobs = jobs.filter((j) => !['done', 'failed', 'cancelled', 'interrupted'].includes(j.status));
  const doneJobs = jobs.filter((j) => j.status === 'done');
  const failedJobs = jobs.filter((j) => ['failed', 'cancelled', 'interrupted'].includes(j.status));
  const unfinishedJob = activeJobs.length > 0;

  if (error) {
    redirectOnError(error);
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h1 className={styles.title}>Downloads</h1>
          <p className={styles.subtitle}>
            Track your conversions and download completed flashcard decks.
          </p>
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={refreshing || loading}
          aria-label="Refresh downloads"
        >
          <i className="fa-solid fa-arrows-rotate" aria-hidden="true" />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          <EmptyDownloadsSection
            hasActiveJobs={unfinishedJob}
            uploads={uploads}
          />

          {unfinishedJob && (
            <div className={styles.section}>
              <UnfinishedJobsInfo />
              <Index
                restartJob={restartJob}
                jobs={activeJobs}
                deleteJob={(id) => deleteJob(id)}
                refreshJobs={refreshJobs}
              />
            </div>
          )}

          {failedJobs.length > 0 && (
            <div className={styles.section}>
              <Index
                restartJob={restartJob}
                jobs={failedJobs}
                deleteJob={(id) => deleteJob(id)}
                refreshJobs={refreshJobs}
              />
            </div>
          )}

          <FinishedJobs
            uploads={uploads}
            deleteUpload={deleteUpload}
            doneJobs={doneJobs}
            deleteJob={deleteJob}
          />
        </>
      )}
    </div>
  );
}
