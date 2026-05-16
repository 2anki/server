import styles from './UploadSourceChips.module.css';

export type UploadSource = 'local' | 'dropbox' | 'google_drive';

interface Props {
  active: UploadSource;
  onChange: (next: UploadSource) => void;
  dropboxAvailable: boolean;
  googleDriveAvailable: boolean;
}

function DropboxIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 4l8 5-8 5-8-5 8-5zm16 0l8 5-8 5-8-5 8-5zM0 19l8-5 8 5-8 5-8-5zm24-5l8 5-8 5-8-5 8-5zM8 26l8-5 8 5-8 5-8-5z" />
    </svg>
  );
}

function GoogleDriveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11 4h10l10 17.5h-10L11 4zm-1 1.7L0 23.2 5 32h10L5 14.5 10 5.7zM10.5 23.5h21L26.5 32H5.5l5-8.5z" />
    </svg>
  );
}

export function UploadSourceChips({
  active,
  onChange,
  dropboxAvailable,
  googleDriveAvailable,
}: Props) {
  return (
    <div className={styles.rail}>
      <span className={styles.label}>Or pick from:</span>
      <div role="group" aria-label="Other sources" className={styles.chips}>
        <button
          type="button"
          aria-label="Dropbox"
          aria-pressed={active === 'dropbox'}
          disabled={!dropboxAvailable}
          className={`${styles.chip} ${active === 'dropbox' ? styles.chipActive : ''}`}
          onClick={() => onChange(active === 'dropbox' ? 'local' : 'dropbox')}
        >
          <DropboxIcon />
          <span>Dropbox</span>
        </button>
        <button
          type="button"
          aria-label="Google Drive"
          aria-pressed={active === 'google_drive'}
          disabled={!googleDriveAvailable}
          className={`${styles.chip} ${active === 'google_drive' ? styles.chipActive : ''}`}
          onClick={() => onChange(active === 'google_drive' ? 'local' : 'google_drive')}
        >
          <GoogleDriveIcon />
          <span>Google Drive</span>
        </button>
      </div>
    </div>
  );
}
