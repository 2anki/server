import { useEffect, useMemo, useState } from 'react';

import sharedStyles from '../../styles/shared.module.css';
import styles from './OpsPage.module.css';
import { BusinessMetricsResponse } from './businessTypes';
import {
  formatCacheAge,
  formatClockShort,
  formatInteger,
  formatPercentOneDecimal,
  formatUsd,
} from './businessHelpers';
import ChartPanel from './charts/ChartPanel';
import MrrTimeseriesChart from './charts/MrrTimeseriesChart';
import ActiveSubsTimeseriesChart from './charts/ActiveSubsTimeseriesChart';
import ConversionsChurnChart from './charts/ConversionsChurnChart';
import FailedPaymentsWeeklyChart from './charts/FailedPaymentsWeeklyChart';
import { useBusinessMetrics } from './useBusinessMetrics';

interface MetricCardProps {
  title: string;
  value: string;
  footnote?: string;
}

function MetricCard({ title, value, footnote }: Readonly<MetricCardProps>) {
  return (
    <section className={`${sharedStyles.surface} ${styles.card}`}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardValue}>{value}</p>
      {footnote != null && <p className={styles.cardFootnote}>{footnote}</p>}
    </section>
  );
}

const formatNumberOrDash = (
  value: number | null,
  format: (n: number) => string
): string => (value == null ? '—' : format(value));

const buildMrrFootnote = (
  asOf: string | null,
  cacheAgeSeconds: number | null
): string | undefined => {
  if (asOf == null) return undefined;
  const date = new Date(asOf);
  if (Number.isNaN(date.getTime())) return undefined;
  const clock = formatClockShort(date);
  if (cacheAgeSeconds == null) return `as of ${clock}`;
  return `as of ${clock} (cache ${formatCacheAge(cacheAgeSeconds)})`;
};

export default function BusinessTab() {
  const { data, error, isLoading } = useBusinessMetrics();
  const [lastSnapshot, setLastSnapshot] = useState<BusinessMetricsResponse | null>(
    null
  );

  useEffect(() => {
    if (data != null) {
      setLastSnapshot(data);
    }
  }, [data]);

  const visible = data ?? lastSnapshot;
  const showInitialSkeleton = isLoading && visible == null;

  const mrrFootnote = useMemo(
    () =>
      buildMrrFootnote(
        visible?.as_of ?? null,
        visible?.cache_age_seconds ?? null
      ),
    [visible?.as_of, visible?.cache_age_seconds]
  );

  return (
    <>
      {error != null && (
        <div className={`${sharedStyles.alertDanger} ${styles.banner}`}>
          /api/ops/business/metrics failed: {error.message}. Last good data shown
          below.
        </div>
      )}

      <div className={styles.cardGrid}>
        <MetricCard
          title="MRR"
          value={formatNumberOrDash(visible?.mrr_usd ?? null, formatUsd)}
          footnote={mrrFootnote}
        />
        <MetricCard
          title="Net new MRR (MTD)"
          value={formatNumberOrDash(
            visible?.net_new_mrr_mtd_usd ?? null,
            formatUsd
          )}
        />
        <MetricCard
          title="Active paying subs"
          value={formatNumberOrDash(
            visible?.active_paying_subs ?? null,
            formatInteger
          )}
        />
        <MetricCard
          title="Churn (30d)"
          value={formatNumberOrDash(
            visible?.churn_30d_pct ?? null,
            formatPercentOneDecimal
          )}
        />
        <MetricCard
          title="Failed payments (7d)"
          value={formatNumberOrDash(
            visible?.failed_payments_7d ?? null,
            formatInteger
          )}
        />
        <MetricCard
          title="New paid conversions (7d)"
          value={formatNumberOrDash(
            visible?.new_paid_conversions_7d ?? null,
            formatInteger
          )}
        />
      </div>

      <div className={styles.grid}>
        <ChartPanel
          title="MRR, last 90 days"
          isLoading={showInitialSkeleton}
          isEmpty={(visible?.mrr_timeseries?.length ?? 0) === 0}
          emptyText="No MRR history yet."
        >
          <MrrTimeseriesChart points={visible?.mrr_timeseries ?? []} />
        </ChartPanel>

        <ChartPanel
          title="Active paying subs, last 90 days"
          isLoading={showInitialSkeleton}
          isEmpty={(visible?.active_subs_timeseries?.length ?? 0) === 0}
          emptyText="No active-subs history yet."
        >
          <ActiveSubsTimeseriesChart
            points={visible?.active_subs_timeseries ?? []}
          />
        </ChartPanel>

        <ChartPanel
          title="New vs churned, last 12 weeks"
          isLoading={showInitialSkeleton}
          isEmpty={(visible?.conversions_vs_churn_weekly?.length ?? 0) === 0}
          emptyText="No subscription movements yet."
        >
          <ConversionsChurnChart
            points={visible?.conversions_vs_churn_weekly ?? []}
          />
        </ChartPanel>

        <ChartPanel
          title="Failed payments, last 12 weeks"
          isLoading={showInitialSkeleton}
          isEmpty={(visible?.failed_payments_weekly?.length ?? 0) === 0}
          emptyText="No failed payments in this window."
        >
          <FailedPaymentsWeeklyChart
            points={visible?.failed_payments_weekly ?? []}
          />
        </ChartPanel>
      </div>
    </>
  );
}
