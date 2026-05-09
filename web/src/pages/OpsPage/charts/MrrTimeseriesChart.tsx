import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import styles from '../OpsPage.module.css';
import { MrrTimeseriesPoint } from '../businessTypes';
import { formatDailyLabel, formatUsd } from '../businessHelpers';

interface MrrTimeseriesChartProps {
  points: MrrTimeseriesPoint[];
}

interface MrrRow {
  t: string;
  label: string;
  mrr_usd: number;
}

const buildRows = (points: MrrTimeseriesPoint[]): MrrRow[] =>
  points.map((point) => ({
    t: point.t,
    label: formatDailyLabel(point.t),
    mrr_usd: point.mrr_usd,
  }));

function MrrTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload == null || payload.length === 0) return null;
  const row = payload[0].payload as MrrRow;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{row.label}</div>
      <div className={styles.tooltipRow}>
        <span>MRR</span>
        <span className={styles.tooltipNumber}>{formatUsd(row.mrr_usd)}</span>
      </div>
    </div>
  );
}

export default function MrrTimeseriesChart({
  points,
}: Readonly<MrrTimeseriesChartProps>) {
  const data = buildRows(points);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          tickFormatter={(value: number) => formatUsd(value)}
        />
        <Tooltip
          content={(props) => <MrrTooltip {...props} />}
          cursor={{ fill: '#f9fafb' }}
        />
        <Area
          type="monotone"
          dataKey="mrr_usd"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
