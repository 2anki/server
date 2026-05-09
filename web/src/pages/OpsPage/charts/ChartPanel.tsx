import { ReactNode } from 'react';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../OpsPage.module.css';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}

interface RenderBodyArgs {
  isLoading: boolean;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}

function renderBody({ isLoading, isEmpty, emptyText, children }: RenderBodyArgs) {
  if (isLoading) {
    return <div className={styles.skeletonBar} aria-hidden="true" />;
  }
  if (isEmpty) {
    return <div className={styles.chartEmpty}>{emptyText}</div>;
  }
  return children;
}

export default function ChartPanel({
  title,
  subtitle,
  isLoading,
  isEmpty,
  emptyText,
  children,
}: Readonly<ChartPanelProps>) {
  return (
    <section className={`${sharedStyles.surface} ${styles.panel}`}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {subtitle != null && <p className={styles.panelSubtitle}>{subtitle}</p>}
      <div className={styles.chartFrame}>{renderBody({ isLoading, isEmpty, emptyText, children })}</div>
    </section>
  );
}
