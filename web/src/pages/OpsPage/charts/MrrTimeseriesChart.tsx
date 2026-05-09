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

import { MrrTimeseriesPoint } from '../businessTypes';
import { formatDailyLabel, formatUsd } from '../businessHelpers';
import {
  AXIS_STROKE,
  AXIS_TICK_STYLE,
  GRID_STROKE,
  SERIES_GREEN,
  TIME_SERIES_CHART_MARGIN,
  TOOLTIP_CURSOR_FILL,
} from './timeSeriesChartHelpers';
import TimeSeriesTooltipShell, {
  TimeSeriesTooltipRow,
} from './TimeSeriesTooltipShell';

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
    <TimeSeriesTooltipShell title={row.label}>
      <TimeSeriesTooltipRow label="MRR" value={formatUsd(row.mrr_usd)} />
    </TimeSeriesTooltipShell>
  );
}

export default function MrrTimeseriesChart({
  points,
}: Readonly<MrrTimeseriesChartProps>) {
  const data = buildRows(points);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={TIME_SERIES_CHART_MARGIN}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK_STYLE}
          stroke={AXIS_STROKE}
          minTickGap={32}
        />
        <YAxis
          tick={AXIS_TICK_STYLE}
          stroke={AXIS_STROKE}
          tickFormatter={(value: number) => formatUsd(value)}
        />
        <Tooltip content={MrrTooltip} cursor={TOOLTIP_CURSOR_FILL} />
        <Area
          type="monotone"
          dataKey="mrr_usd"
          stroke={SERIES_GREEN}
          fill={SERIES_GREEN}
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
