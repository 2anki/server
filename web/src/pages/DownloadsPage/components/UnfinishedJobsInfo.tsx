import styles from '../DownloadsPage.module.css';
import sharedStyles from '../../../styles/shared.module.css';

export function UnfinishedJobsInfo() {
  return (
    <div className={styles.preparingBanner}>
      <div className={sharedStyles.spinnerSmall} />
      Your conversion is in progress. This may take a few moments.
    </div>
  );
}
