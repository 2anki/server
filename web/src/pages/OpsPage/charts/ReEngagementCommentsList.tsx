import { ReEngagementCommentPoint } from '../businessTypes';
import styles from '../OpsPage.module.css';

interface ReEngagementCommentsListProps {
  points: ReEngagementCommentPoint[];
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

export default function ReEngagementCommentsList({
  points,
}: Readonly<ReEngagementCommentsListProps>) {
  return (
    <ul className={styles.commentList}>
      {points.map((point, idx) => (
        <li key={`${point.created_at}-${idx}`} className={styles.commentItem}>
          <div className={styles.commentMeta}>
            <span className={styles.commentReason}>
              {point.stopped_reason} · {point.content_type}
            </span>
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
