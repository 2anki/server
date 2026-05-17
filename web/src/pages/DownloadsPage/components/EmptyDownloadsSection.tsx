import { Link } from 'react-router-dom';
import UserUpload from '../../../lib/interfaces/UserUpload';
import styles from '../DownloadsPage.module.css';

interface Prop {
  hasActiveJobs: boolean;
  uploads: UserUpload[] | undefined;
}

export function EmptyDownloadsSection({ hasActiveJobs, uploads }: Readonly<Prop>) {
  if (hasActiveJobs || (uploads ?? []).length > 0) {
    return null;
  }
  return (
    <div className={styles.card}>
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No decks yet</p>
        <p className={styles.emptyDescription}>
          Paste a Notion link or upload a file to make your first deck.
        </p>
        <Link to="/notion" className={styles.emptyLink}>
          Make a deck
        </Link>
      </div>
    </div>
  );
}
