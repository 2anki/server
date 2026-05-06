import { useState } from 'react';
import { Link } from 'react-router-dom';

import UserUpload from '../../../lib/interfaces/UserUpload';
import { JobsId } from '../../../schemas/public/Jobs';
import JobResponse from '../../../schemas/public/JobResponse';
import { getDistance } from '../../../lib/getDistance';
import DownloadIcon from '../../../components/icons/DownloadIcon';
import EyeIcon from '../../../components/icons/EyeIcon';
import TrashIcon from '../../../components/icons/TrashIcon';
import styles from '../DownloadsPage.module.css';
import sharedStyles from '../../../styles/shared.module.css';

const APKG_PATTERN = /\.apkg$/i;

interface Prop {
  readonly uploads: UserUpload[] | undefined;
  readonly deleteUpload: (key: string) => Promise<void>;
  readonly doneJobs?: JobResponse[];
  readonly deleteJob?: (id: JobsId) => void;
}

export function FinishedJobs({ uploads, deleteUpload, doneJobs = [], deleteJob }: Prop) {
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  if ((!uploads || uploads.length === 0) && doneJobs.length === 0) {
    return null;
  }

  const handleDelete = async (key: string) => {
    setDeletingKey(key);
    try {
      await deleteUpload(key);
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <img
          src="/icons/Anki_app_logo.png"
          alt="Anki Logo"
          className={styles.sectionIcon}
        />
        <h2 className={styles.sectionTitle}>Ready to Download</h2>
      </div>
      <p className={styles.sectionDescription}>
        Your flashcard decks are ready. Download them into Anki.
      </p>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th className={sharedStyles.actionColumnWide}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doneJobs.map((j) => (
              <tr key={j.id}>
                <td>
                  <span data-hj-suppress className={styles.fileName}>
                    {j.title}
                  </span>
                </td>
                <td>
                  {j.created_at && (
                    <span className={styles.timeAgo}>
                      {getDistance(j.created_at)} ago
                    </span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    {deleteJob && (
                      <button
                        type="button"
                        onClick={() => deleteJob(j.id)}
                        className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                        aria-label={`Delete ${j.title}`}
                        title="Delete"
                      >
                        <TrashIcon width={18} height={18} />
                      </button>
                    )}
                    <a
                      href={`/api/upload/jobs/${j.object_id}/download`}
                      className={styles.iconButton}
                      aria-label={`Download ${j.title}`}
                      title="Download"
                    >
                      <DownloadIcon width={18} height={18} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {(uploads ?? []).map((u) => (
              <tr key={u.key}>
                <td>
                  <span data-hj-suppress className={styles.fileName}>
                    {u.filename}
                  </span>
                </td>
                <td>
                  {u.created_at && (
                    <span className={styles.timeAgo}>
                      {getDistance(u.created_at)} ago
                    </span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.key)}
                      className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                      disabled={deletingKey === u.key}
                      aria-label={`Delete ${u.filename}`}
                      title={deletingKey === u.key ? 'Deleting…' : 'Delete'}
                    >
                      <TrashIcon width={18} height={18} />
                    </button>
                    {APKG_PATTERN.test(u.key) && (
                      <Link
                        to={`/preview/apkg/${encodeURIComponent(u.key)}`}
                        className={styles.iconButton}
                        aria-label={`Preview ${u.filename}`}
                        title="Preview"
                      >
                        <EyeIcon width={18} height={18} />
                      </Link>
                    )}
                    <a
                      href={`/api/download/u/${u.key}`}
                      className={styles.iconButton}
                      aria-label={`Download ${u.filename}`}
                      title="Download"
                    >
                      <DownloadIcon width={18} height={18} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
