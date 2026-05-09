import { ReactNode } from 'react';
import styles from './DocsPage.module.css';

export type CalloutVariant = 'note' | 'tip' | 'warning';

interface CalloutProps {
  variant: CalloutVariant;
  children: ReactNode;
}

const variantClass: Record<CalloutVariant, string> = {
  note: styles.calloutNote,
  tip: styles.calloutTip,
  warning: styles.calloutWarning,
};

export function Callout({ variant, children }: Readonly<CalloutProps>) {
  return (
    <aside className={`${styles.callout} ${variantClass[variant]}`} role="note">
      {children}
    </aside>
  );
}
