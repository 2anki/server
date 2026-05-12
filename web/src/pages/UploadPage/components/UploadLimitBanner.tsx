import { Link } from 'react-router-dom';
import sharedStyles from '../../../styles/shared.module.css';
import styles from './UploadLimitBanner.module.css';

interface UploadLimitBannerProps {
  readonly filename: string | null;
  readonly isAnonymous: boolean;
  readonly onDismiss: () => void;
}

export function UploadLimitBanner({
  filename,
  isAnonymous,
  onDismiss,
}: UploadLimitBannerProps) {
  return (
    <div className={styles.banner} role="alert">
      <p className={styles.title}>
        You've reached the free conversion limit
      </p>
      <p className={styles.description}>
        {isAnonymous
          ? 'Sign up for a free account to download your deck, or upgrade for unlimited conversions.'
          : 'Upgrade your plan to continue converting files.'}
      </p>
      {filename && <p className={styles.filename}>{filename}</p>}
      <div className={styles.actions}>
        {isAnonymous ? (
          <Link
            to="/register?redirect=/upload"
            className={`${sharedStyles.btnPrimary} ${sharedStyles.btnInline}`}
          >
            Sign up to download
          </Link>
        ) : (
          <Link
            to="/pricing"
            className={`${sharedStyles.btnPrimary} ${sharedStyles.btnInline}`}
          >
            Upgrade to continue
          </Link>
        )}
        <button type="button" className={styles.dismiss} onClick={onDismiss}>
          Try a different file
        </button>
      </div>
    </div>
  );
}
