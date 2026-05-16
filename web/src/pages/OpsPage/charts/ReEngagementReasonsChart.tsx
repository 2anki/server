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

import { ReEngagementReasonPoint } from '../businessTypes';
import TimeSeriesTooltipShell, {
  TimeSeriesTooltipRow,
} from './TimeSeriesTooltipShell';
import {
  AXIS_STROKE,
  AXIS_TICK_STYLE,
  GRID_STROKE,
  SERIES_RED,
  TOOLTIP_CURSOR_FILL,
} from './timeSeriesChartHelpers';

interface ReEngagementReasonsChartProps {
  points: ReEngagementReasonPoint[];
}

interface ReasonRow {
  stopped_reason: string;
  count: number;
}

const buildRows = (points: ReEngagementReasonPoint[]): ReasonRow[] =>
  points.map((point) => ({
    stopped_reason: point.stopped_reason,
    count: point.count,
  }));

function ReasonsTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload == null || payload.length === 0) return null;
  const row = payload[0].payload as ReasonRow;
  return (
    <TimeSeriesTooltipShell title={row.stopped_reason}>
      <TimeSeriesTooltipRow label="stops" value={row.count.toLocaleString()} />
    </TimeSeriesTooltipShell>
  );
}

const HORIZONTAL_MARGIN = {
  top: 8,
  right: 16,
  left: 0,
  bottom: 0,
} as const;

export default function ReEngagementReasonsChart({
  points,
}: Readonly<ReEngagementReasonsChartProps>) {
  const data = buildRows(points);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={HORIZONTAL_MARGIN}>
        <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS_TICK_STYLE}
          stroke={AXIS_STROKE}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="stopped_reason"
          tick={AXIS_TICK_STYLE}
          stroke={AXIS_STROKE}
          width={160}
        />
        <Tooltip content={ReasonsTooltip} cursor={TOOLTIP_CURSOR_FILL} />
        <Bar dataKey="count" fill={SERIES_RED} />
      </BarChart>
    </ResponsiveContainer>
  );
}
