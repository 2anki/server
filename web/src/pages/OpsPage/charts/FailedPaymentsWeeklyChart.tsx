import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import styles from '../OpsPage.module.css';
import { FailedPaymentsWeekPoint } from '../businessTypes';
import { formatWeekLabel } from '../businessHelpers';

interface FailedPaymentsWeeklyChartProps {
  points: FailedPaymentsWeekPoint[];
}

interface WeekRow {
  week: string;
  label: string;
  count: number;
}

const buildRows = (points: FailedPaymentsWeekPoint[]): WeekRow[] =>
  points.map((point) => ({
    week: point.week,
    label: formatWeekLabel(point.week),
    count: point.count,
  }));

function FailedPaymentsTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload == null || payload.length === 0) return null;
  const row = payload[0].payload as WeekRow;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{row.label}</div>
      <div className={styles.tooltipRow}>
        <span>failed</span>
        <span className={styles.tooltipNumber}>{row.count.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function FailedPaymentsWeeklyChart({
  points,
}: Readonly<FailedPaymentsWeeklyChartProps>) {
  const data = buildRows(points);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          stroke="#e5e7eb"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          stroke="#e5e7eb"
          allowDecimals={false}
        />
        <Tooltip
          content={(props) => <FailedPaymentsTooltip {...props} />}
          cursor={{ fill: '#f9fafb' }}
        />
        <Bar dataKey="count" fill="#dc2626" />
      </BarChart>
    </ResponsiveContainer>
  );
}
