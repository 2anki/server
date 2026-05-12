import styles from '../ImportPage.module.css';

interface ImportProgressProps {
  imported: number;
  total: number;
  fileName: string;
  pageTitle: string;
}

export default function ImportProgress({
  imported,
  total,
  fileName,
  pageTitle,
}: Readonly<ImportProgressProps>) {
  const percent = total > 0 ? Math.round((imported / total) * 100) : 0;

  return (
    <div className={styles.progressContainer}>
      <p className={styles.progressTitle}>Importing to Notion</p>
      {fileName && pageTitle && (
        <p className={styles.progressSummary}>
          {fileName} &rarr; {pageTitle}
        </p>
      )}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={styles.progressCount}>
        {imported} of {total} cards
      </p>
      <p className={styles.progressReassurance}>
        {total > 50
          ? "This usually takes about a minute. You can leave this page — we'll keep going in the background."
          : "This usually takes a few seconds. You can leave this page — we'll keep going in the background."}
      </p>
    </div>
  );
}
