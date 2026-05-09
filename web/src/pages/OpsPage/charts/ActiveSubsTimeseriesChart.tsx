import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import styles from '../OpsPage.module.css';
import { ActiveSubsTimeseriesPoint } from '../businessTypes';
import { formatDailyLabel } from '../businessHelpers';

interface ActiveSubsTimeseriesChartProps {
  points: ActiveSubsTimeseriesPoint[];
}

interface ActiveSubsRow {
  t: string;
  label: string;
  active_paying_subs: number;
}

const buildRows = (points: ActiveSubsTimeseriesPoint[]): ActiveSubsRow[] =>
  points.map((point) => ({
    t: point.t,
    label: formatDailyLabel(point.t),
    active_paying_subs: point.active_paying_subs,
  }));

function ActiveSubsTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload == null || payload.length === 0) return null;
  const row = payload[0].payload as ActiveSubsRow;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{row.label}</div>
      <div className={styles.tooltipRow}>
        <span>active</span>
        <span className={styles.tooltipNumber}>
          {row.active_paying_subs.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function ActiveSubsTimeseriesChart({
  points,
}: Readonly<ActiveSubsTimeseriesChartProps>) {
  const data = buildRows(points);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          stroke="#e5e7eb"
          minTickGap={32}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          stroke="#e5e7eb"
          allowDecimals={false}
        />
        <Tooltip
          content={(props) => <ActiveSubsTooltip {...props} />}
          cursor={{ fill: '#f9fafb' }}
        />
        <Line
          type="monotone"
          dataKey="active_paying_subs"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
