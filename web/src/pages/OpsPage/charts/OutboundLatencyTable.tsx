import { formatCount } from '../opsHelpers';
import { OpsMetricsServiceLatencyPoint } from '../opsTypes';
import styles from '../OpsPage.module.css';

interface OutboundLatencyTableProps {
  rows: OpsMetricsServiceLatencyPoint[];
}

const formatMs = (value: number): string => {
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(2)} s`;
};

export default function OutboundLatencyTable({
  rows,
}: Readonly<OutboundLatencyTableProps>) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Service</th>
          <th>p50</th>
          <th>p95</th>
          <th>p99</th>
          <th>Calls</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.service}>
            <td>{row.service}</td>
            <td className={styles.numeric}>{formatMs(row.p50_ms)}</td>
            <td className={styles.numeric}>{formatMs(row.p95_ms)}</td>
            <td className={styles.numeric}>{formatMs(row.p99_ms)}</td>
            <td className={styles.numeric}>{formatCount(row.count)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
