import React, { type ErrorInfo, type ReactNode } from 'react';

import styles from '../../styles/shared.module.css';

type LocalDataRecoveryBoundaryProps = Readonly<{
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  reloadPage?: () => void;
  storage?: Pick<Storage, 'clear'>;
}>;

type LocalDataRecoveryBoundaryState = {
  error: Error | null;
  resetFailed: boolean;
};

export class LocalDataRecoveryBoundary extends React.Component<
  LocalDataRecoveryBoundaryProps,
  LocalDataRecoveryBoundaryState
> {
  state: LocalDataRecoveryBoundaryState = {
    error: null,
    resetFailed: false,
  };

  static getDerivedStateFromError(error: Error): LocalDataRecoveryBoundaryState {
    return { error, resetFailed: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  private reloadPage = () => {
    const reload = this.props.reloadPage ?? (() => globalThis.location.reload());
    reload();
  };

  private resetLocalData = () => {
    try {
      const storage = this.props.storage ?? globalThis.localStorage;
      storage.clear();
    } catch {
      this.setState({ resetFailed: true });
      return;
    }

    this.reloadPage();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className={styles.pageNarrow}>
        <section className={styles.card} role="alert" aria-live="assertive">
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>2anki could not finish loading</h1>
            <p className={styles.subtitle}>
              A saved browser value may be incompatible with the current app
              version. Reset local data for this browser to recover without
              waiting for support.
            </p>
          </header>

          {this.state.resetFailed && (
            <p className={styles.notificationDanger}>
              Local data could not be reset automatically. Clear site data for
              2anki in your browser settings, then reload the page.
            </p>
          )}

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`${styles.btnPrimary} ${styles.btnInline}`}
              onClick={this.resetLocalData}
            >
              Reset local data
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={this.reloadPage}
            >
              Reload
            </button>
          </div>
        </section>
      </main>
    );
  }
}
