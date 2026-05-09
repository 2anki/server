import sharedStyles from '../../styles/shared.module.css';
import styles from './OpsPage.module.css';
import { useBusinessMetrics } from './useBusinessMetrics';

export default function BusinessTab() {
  const { data, error, isLoading } = useBusinessMetrics();

  return (
    <>
      {error != null && (
        <div className={`${sharedStyles.alertDanger} ${styles.banner}`}>
          /api/ops/business/metrics failed: {error.message}.
        </div>
      )}
      {isLoading && data == null && (
        <p className={styles.subtitle}>Loading business metrics…</p>
      )}
      {data != null && (
        <pre
          data-testid="business-metrics-json"
          className={`${sharedStyles.surface} ${styles.businessJson}`}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </>
  );
}
