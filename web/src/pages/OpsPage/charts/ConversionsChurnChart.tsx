import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import styles from '../OpsPage.module.css';
import { ConversionsChurnWeekPoint } from '../businessTypes';
import { formatWeekLabel } from '../businessHelpers';

interface ConversionsChurnChartProps {
  points: ConversionsChurnWeekPoint[];
}

interface WeekRow {
  week: string;
  label: string;
  new_paying: number;
  churned: number;
}

const buildRows = (points: ConversionsChurnWeekPoint[]): WeekRow[] =>
  points.map((point) => ({
    week: point.week,
    label: formatWeekLabel(point.week),
    new_paying: point.new_paying,
    churned: point.churned,
  }));

function ConversionsChurnTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload == null || payload.length === 0) return null;
  const row = payload[0].payload as WeekRow;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{row.label}</div>
      <div className={styles.tooltipRow}>
        <span>new</span>
        <span className={styles.tooltipNumber}>
          {row.new_paying.toLocaleString()}
        </span>
      </div>
      <div className={styles.tooltipRow}>
        <span>churned</span>
        <span className={styles.tooltipNumber}>
          {row.churned.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function ConversionsChurnChart({
  points,
}: Readonly<ConversionsChurnChartProps>) {
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
          content={(props) => <ConversionsChurnTooltip {...props} />}
          cursor={{ fill: '#f9fafb' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="new_paying" fill="#10b981" name="new" />
        <Bar dataKey="churned" fill="#dc2626" name="churned" />
      </BarChart>
    </ResponsiveContainer>
  );
}
