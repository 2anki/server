import { Link } from 'react-router-dom';
import UserUpload from '../../../lib/interfaces/UserUpload';
import styles from '../DownloadsPage.module.css';

interface Prop {
  hasActiveJobs: boolean;
  uploads: UserUpload[] | undefined;
}

export function EmptyDownloadsSection({ hasActiveJobs, uploads }: Prop) {
  if (hasActiveJobs || (uploads ?? []).length > 0) {
    return null;
  }
  return (
    <div className={styles.card}>
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📭</div>
        <p className={styles.emptyTitle}>No downloads yet</p>
        <p className={styles.emptyDescription}>
          Convert a Notion page or upload a file to get started.
        </p>
        <Link to="/notion" className={styles.emptyLink}>
          Get started
        </Link>
      </div>
    </div>
  );
}
