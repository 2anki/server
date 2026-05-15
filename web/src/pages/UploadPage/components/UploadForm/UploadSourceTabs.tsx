import styles from './UploadSourceTabs.module.css';

export type UploadSource = 'local' | 'dropbox' | 'google_drive';

interface Props {
  active: UploadSource;
  onChange: (next: UploadSource) => void;
  dropboxAvailable: boolean;
  googleDriveAvailable: boolean;
}

export function UploadSourceTabs({
  active,
  onChange,
  dropboxAvailable,
  googleDriveAvailable,
}: Props) {
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
      {googleDriveAvailable && (
        <button
          type="button"
          role="tab"
          aria-selected={active === 'google_drive'}
          aria-controls="upload-panel-google-drive"
          className={`${styles.tab} ${active === 'google_drive' ? styles.tabActive : ''}`}
          onClick={() => onChange('google_drive')}
        >
          Google Drive
        </button>
      )}
    </div>
  );
}
