import styles from '../styles/shared.module.css';

function NotFoundPage() {
  return (
    <div className={`${styles.pageNarrow} ${styles.textCenter}`}>
      <div className={styles.emptyState}>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.secondaryText}>
          This page doesn't exist or may have moved.
        </p>
        <p>
          <a href="/" className={styles.btnPrimary} style={{ display: 'inline-flex', width: 'auto' }}>
            Go to homepage
          </a>
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
