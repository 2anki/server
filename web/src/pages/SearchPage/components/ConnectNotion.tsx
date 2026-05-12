import styles from '../../../styles/shared.module.css';

interface Props {
  ready: boolean;
  connectionLink: string;
}

export default function ConnectNotion({ ready, connectionLink }: Readonly<Props>) {
  if (!ready) return null;

  return (
    <div className={`${styles.flexColumn} ${styles.connectWrapper}`}>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Connect your Notion workspace</h3>
        <p className={styles.marginBottomMd}>
          Search and convert pages directly. We only read the pages you
          share with 2anki.
        </p>
        <a className={styles.btnPrimary} href={connectionLink}>
          Connect to Notion
        </a>
      </div>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Upload files instead</h3>
        <p className={styles.marginBottomMd}>
          Export from Notion and upload the file. Uploaded files are
          automatically deleted after 2 hours.
        </p>
        <a className={styles.btnSecondary} href="/upload">
          Upload a file
        </a>
      </div>
    </div>
  );
}
