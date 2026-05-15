import styles from './UploadSourceTabs.module.css';

export type UploadSource = 'local' | 'dropbox';

interface Props {
  active: UploadSource;
  onChange: (next: UploadSource) => void;
  dropboxAvailable: boolean;
}

export function UploadSourceTabs({ active, onChange, dropboxAvailable }: Props) {
  return (
    <div
      className={styles.tabs}
      role="tablist"
      aria-label="Upload source"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === 'local'}
        aria-controls="upload-panel-local"
        className={`${styles.tab} ${active === 'local' ? styles.tabActive : ''}`}
        onClick={() => onChange('local')}
      >
        Your computer
      </button>
      {dropboxAvailable && (
        <button
          type="button"
          role="tab"
          aria-selected={active === 'dropbox'}
          aria-controls="upload-panel-dropbox"
          className={`${styles.tab} ${active === 'dropbox' ? styles.tabActive : ''}`}
          onClick={() => onChange('dropbox')}
        >
          Dropbox
        </button>
      )}
    </div>
  );
}
