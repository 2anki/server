import styles from '../DownloadsPage.module.css';

export function UnfinishedJobsInfo() {
  return (
    <div className={styles.preparingBanner}>
      <div className={styles.spinner} />
      Your conversion is in progress. This may take a few moments.
    </div>
  );
}
