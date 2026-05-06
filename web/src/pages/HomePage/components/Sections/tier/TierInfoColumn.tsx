import styles from '../../../../../styles/shared.module.css';

interface TierInfoColumnProps {
  title: string;
  description: string;
  action?: {
    text: string;
    link: string;
  };
}

export function TierInfoColumn({
  title,
  description,
  action,
}: Readonly<TierInfoColumnProps>) {
  return (
    <div className={styles.sectionCard}>
      <h1 className={styles.sectionTitle}>{title}</h1>
      <p>{description}</p>
      {action && <a href={action.link}>{action.text}</a>}
      {!action && <p className={styles.sectionTitle}>FREE</p>}
    </div>
  );
}
