import styles from '../../../styles/shared.module.css';

interface Props {
  ready: boolean;
  connectionLink: string;
}

export default function ConnectNotion({ ready, connectionLink }: Props) {
  if (!ready) return null;

  return (
    <div className={`${styles.flexColumn} ${styles.connectWrapper}`}>
      <p className={styles.textCenter}>
        There are two ways to use 2anki.net. Choose how you want to use it:
      </p>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Connect to Notion</h3>
        <p className={styles.marginBottomMd}>
          Click to convert, generated files are stored and converted in the
          background.
        </p>
        <a className={styles.btnPrimary} href={connectionLink}>
          Connect
        </a>
        <p className={styles.smallDescription}>
          We only read the pages you select. We don&apos;t store your Notion
          content.
        </p>
      </div>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Manual File Upload</h3>
        <p className={styles.marginBottomMd}>
          Upload your exported Notion files manually, and they will be
          auto-deleted.
        </p>
        <a className={styles.btnSecondary} href="/upload">
          Upload
        </a>
      </div>
    </div>
  );
}
