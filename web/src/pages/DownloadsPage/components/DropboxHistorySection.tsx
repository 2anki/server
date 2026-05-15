import { useState } from 'react';

import Backend, { DropboxUpload } from '../../../lib/backend';
import useDropboxUploads from '../hooks/useDropboxUploads';
import { DropboxHistoryEntry } from './DropboxHistoryEntry';
import styles from '../DownloadsPage.module.css';

interface Props {
  backend: Backend;
}

export function DropboxHistorySection({ backend }: Readonly<Props>) {
  const { uploads, loading, error, deleteUpload, loadMore, hasMore } =
    useDropboxUploads(backend);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (loading) return null;

  if (error) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>From Dropbox</h2>
        </div>
        <p className={styles.sectionDescription}>
          Couldn&apos;t load your Dropbox history right now. Refresh to try again.
        </p>
      </div>
    );
  }

  if (uploads.length === 0) return null;

  const handleDelete = async (id: number) => {
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
        <h2 className={styles.sectionTitle}>From Dropbox</h2>
      </div>
      <p className={styles.sectionDescription}>
        Files you picked from Dropbox. Convert any of them again in one click.
      </p>
      <div className={styles.card}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>File</th>
                <th className={styles.actions} />
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload: DropboxUpload) => (
                <DropboxHistoryEntry
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              Show older Dropbox files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
