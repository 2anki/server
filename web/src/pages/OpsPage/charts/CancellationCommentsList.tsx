import { CancellationCommentPoint } from '../businessTypes';
import styles from '../OpsPage.module.css';

interface CancellationCommentsListProps {
  points: CancellationCommentPoint[];
}

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

export default function CancellationCommentsList({
  points,
}: Readonly<CancellationCommentsListProps>) {
  return (
    <ul className={styles.commentList}>
      {points.map((point, idx) => (
        <li key={`${point.created_at}-${idx}`} className={styles.commentItem}>
          <div className={styles.commentMeta}>
            <span className={styles.commentReason}>{point.reason}</span>
            <span className={styles.commentDate}>
              {formatDate(point.created_at)}
            </span>
          </div>
          <p className={styles.commentBody}>{point.comment}</p>
        </li>
      ))}
    </ul>
  );
}
