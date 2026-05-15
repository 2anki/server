import { useState } from 'react';

import { GoogleDriveUpload } from '../../../lib/backend';
import { getDistance } from '../../../lib/getDistance';
import styles from '../DownloadsPage.module.css';

interface Props {
  upload: GoogleDriveUpload;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

const GENERIC_ICON = '/icons/file-generic.svg';
const ALLOWED_ICON_HOSTS = new Set([
  'drive-thirdparty.googleusercontent.com',
  'ssl.gstatic.com',
  'lh3.googleusercontent.com',
]);
const ALLOWED_LINK_HOSTS = new Set(['drive.google.com', 'docs.google.com']);

function formatSize(sizeBytes: string | null): string {
  if (sizeBytes == null) return '—';
  const n = Number(sizeBytes);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1024 * 1024) {
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(n / 1024)} KB`;
}

function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}…`;
}

function safeIconSrc(iconUrl: string): string {
  try {
    const u = new URL(iconUrl);
    if (u.protocol !== 'https:') return GENERIC_ICON;
    return ALLOWED_ICON_HOSTS.has(u.host) ? iconUrl : GENERIC_ICON;
  } catch {
    return GENERIC_ICON;
  }
}

function safeDriveLink(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return null;
    return ALLOWED_LINK_HOSTS.has(u.host) ? url : null;
  } catch {
    return null;
  }
}

export function GoogleDriveHistoryEntry({
  upload,
  onDelete,
  isDeleting,
}: Readonly<Props>) {
  const [iconSrc, setIconSrc] = useState(safeIconSrc(upload.iconUrl));
  const driveHref = safeDriveLink(upload.url);

  return (
    <tr style={{ opacity: isDeleting ? 0.5 : 1 }}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <img
            src={iconSrc}
            alt=""
            width={20}
            height={20}
            onError={() => setIconSrc(GENERIC_ICON)}
            style={{ flexShrink: 0 }}
          />
          <span
            data-hj-suppress
            className={styles.fileName}
            title={upload.name}
            style={{ fontWeight: 500 }}
          >
            {truncateName(upload.name, 40)}
          </span>
        </div>
      </td>
      <td className={styles.timeAgo}>{formatSize(upload.sizeBytes)}</td>
      <td className={styles.timeAgo}>
        {upload.last_converted_at == null
          ? '—'
          : `${getDistance(upload.last_converted_at)} ago`}
      </td>
      <td>
        <div className={styles.actions}>
          {driveHref == null ? (
            <span
              className={styles.previewButton}
              title="Link unavailable"
              aria-disabled="true"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              Open in Drive ↗
            </span>
          ) : (
            <a
              className={styles.previewButton}
              href={driveHref}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open in Drive ↗
            </a>
          )}
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            onClick={() => onDelete(upload.id)}
            disabled={isDeleting}
            aria-label={isDeleting ? 'Removing…' : `Remove ${upload.name}`}
            title="Remove"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}
