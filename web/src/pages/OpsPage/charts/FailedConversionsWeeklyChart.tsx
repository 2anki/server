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

import { FailedConversionsWeekPoint } from '../conversionTypes';
import { formatWeekLabel } from '../businessHelpers';
import {
  AXIS_STROKE,
  AXIS_TICK_STYLE,
  GRID_STROKE,
  SERIES_RED,
  TIME_SERIES_CHART_MARGIN,
  TOOLTIP_CURSOR_FILL,
} from './timeSeriesChartHelpers';
import TimeSeriesTooltipShell, {
  TimeSeriesTooltipRow,
} from './TimeSeriesTooltipShell';

interface FailedConversionsWeeklyChartProps {
  points: FailedConversionsWeekPoint[];
}

interface WeekRow {
  week: string;
  label: string;
  count: number;
}

const buildRows = (points: FailedConversionsWeekPoint[]): WeekRow[] =>
  points.map((point) => ({
    week: point.week,
    label: formatWeekLabel(point.week),
    count: point.count,
  }));

function FailedConversionsTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload == null || payload.length === 0) return null;
  const row = payload[0].payload as WeekRow;
  return (
    <TimeSeriesTooltipShell title={row.label}>
      <TimeSeriesTooltipRow label="failed" value={row.count.toLocaleString()} />
    </TimeSeriesTooltipShell>
  );
}

export default function FailedConversionsWeeklyChart({
  points,
}: Readonly<FailedConversionsWeeklyChartProps>) {
  const data = buildRows(points);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={TIME_SERIES_CHART_MARGIN}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK_STYLE} stroke={AXIS_STROKE} />
        <YAxis
          tick={AXIS_TICK_STYLE}
          stroke={AXIS_STROKE}
          allowDecimals={false}
        />
        <Tooltip
          content={FailedConversionsTooltip}
          cursor={TOOLTIP_CURSOR_FILL}
        />
        <Bar dataKey="count" fill={SERIES_RED} />
      </BarChart>
    </ResponsiveContainer>
  );
}
