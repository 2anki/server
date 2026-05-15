import { DropboxUpload } from '../../../lib/backend';
import { getDistance } from '../../../lib/getDistance';
import styles from '../DownloadsPage.module.css';

interface Props {
  upload: DropboxUpload;
  onDelete: (id: number) => Promise<void>;
  isDeleting: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}…`;
}

export function DropboxHistoryEntry({ upload, onDelete, isDeleting }: Readonly<Props>) {
  return (
    <tr style={{ opacity: isDeleting ? 0.5 : 1 }}>
      <td>
        <span
          data-hj-suppress
          className={styles.fileName}
          title={upload.name}
          style={{ fontWeight: 500 }}
        >
          {truncateName(upload.name, 40)}
        </span>
        <div className={styles.timeAgo}>
          {formatBytes(upload.bytes)}
          {upload.created_at != null && (
            <> · {getDistance(upload.created_at)} ago</>
          )}
        </div>
      </td>
      <td>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onDelete(upload.id)}
            disabled={isDeleting}
            aria-label={`Remove ${upload.name}`}
            title="Remove"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}
