import { ReactNode } from 'react';

import styles from '../OpsPage.module.css';

interface TimeSeriesTooltipShellProps {
  title: string;
  children: ReactNode;
}

export default function TimeSeriesTooltipShell({
  title,
  children,
}: Readonly<TimeSeriesTooltipShellProps>) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{title}</div>
      {children}
    </div>
  );
}

interface TimeSeriesTooltipRowProps {
  label: string;
  value: string;
}

export function TimeSeriesTooltipRow({
  label,
  value,
}: Readonly<TimeSeriesTooltipRowProps>) {
  return (
    <div className={styles.tooltipRow}>
      <span>{label}</span>
      <span className={styles.tooltipNumber}>{value}</span>
    </div>
  );
}
