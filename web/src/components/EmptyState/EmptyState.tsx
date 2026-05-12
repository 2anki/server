import { Link } from 'react-router-dom';
import sharedStyles from '../../styles/shared.module.css';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  readonly icon?: string;
  readonly title: string;
  readonly description?: string;
  readonly actionLabel?: string;
  readonly actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className={`${sharedStyles.btnPrimary} ${sharedStyles.btnInline}`}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
