import styles from './DocsPage.module.css';

export function WipBanner() {
  return (
    <div className={styles.wipBanner} role="note">
      <span className={styles.wipLabel}>WIP</span>
      <span className={styles.wipText}>
        These docs are being actively rewritten. Found something wrong or
        missing?{' '}
        <a
          href="https://github.com/2anki/web/issues/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open an issue
        </a>{' '}
        or{' '}
        <a
          href="https://github.com/2anki/web"
          target="_blank"
          rel="noopener noreferrer"
        >
          contribute on GitHub
        </a>
        .
      </span>
    </div>
  );
}
