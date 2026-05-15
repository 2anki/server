import { useState } from 'react';

import Backend, { GoogleDriveUpload } from '../../../lib/backend';
import useGoogleDriveUploads from '../hooks/useGoogleDriveUploads';
import { GoogleDriveHistoryEntry } from './GoogleDriveHistoryEntry';
import styles from '../DownloadsPage.module.css';

interface Props {
  backend: Backend;
}

export function GoogleDriveHistorySection({ backend }: Readonly<Props>) {
  const { uploads, loading, error, deleteUpload, loadMore, hasMore } =
    useGoogleDriveUploads(backend);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loading) return null;

  if (error) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>From Google Drive</h2>
        </div>
        <p className={styles.sectionDescription}>
          We couldn&apos;t load your Google Drive history. Refresh the page to
          try again.
        </p>
      </div>
    );
  }

  if (uploads.length === 0) return null;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteUpload(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>From Google Drive</h2>
      </div>
      <p className={styles.sectionDescription}>
        Files you picked from Google Drive. Open them in Drive or remove them
        from this list.
      </p>
      <div className={styles.card}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>File</th>
                <th>Size</th>
                <th>Added</th>
                <th className={styles.actions} />
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload: GoogleDriveUpload) => (
                <GoogleDriveHistoryEntry
                  key={upload.id}
                  upload={upload}
                  onDelete={handleDelete}
                  isDeleting={deletingId === upload.id}
                />
              ))}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className={styles.upgradeFooter}>
            <button
              type="button"
              onClick={loadMore}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                padding: 0,
              }}
            >
              Show older Google Drive files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
