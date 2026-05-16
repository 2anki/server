import sharedStyles from '../../styles/shared.module.css';
import styles from './OpsPage.module.css';

interface MetricCardProps {
  title: string;
  value: string;
  footnote?: string;
}

export default function MetricCard({
  title,
  value,
  footnote,
}: Readonly<MetricCardProps>) {
  return (
    <section className={`${sharedStyles.surface} ${styles.card}`}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardValue}>{value}</p>
      {footnote != null && <p className={styles.cardFootnote}>{footnote}</p>}
    </section>
  );
}

export const formatNumberOrDash = (
  value: number | null,
  format: (n: number) => string
): string => (value == null ? '—' : format(value));
