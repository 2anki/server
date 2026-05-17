import { Link } from 'react-router-dom';
import styles from '../DownloadsPage.module.css';

interface Props {
  isEmpty: boolean;
}

export function EmptyDownloadsSection({ isEmpty }: Readonly<Props>) {
  if (!isEmpty) {
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
