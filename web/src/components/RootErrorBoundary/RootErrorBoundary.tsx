import React, { type ErrorInfo, type ReactNode } from 'react';

import styles from '../../styles/shared.module.css';

type LocalDataRecoveryBoundaryProps = Readonly<{
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  reloadPage?: () => void;
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

  private readonly defaultReload = () => window.location.reload();

  private readonly reloadPage = () => {
    (this.props.reloadPage ?? this.defaultReload)();
  };

  private readonly resetLocalData = () => {
    try {
      window.localStorage.clear();
    } catch {
      this.setState({ resetFailed: true });
      return;
    }

    this.reloadPage();
  };

  render() {
    if (this.state.error) {
      return (
        <main className={styles.pageNarrow}>
          <section className={styles.card} role="alert" aria-live="assertive">
            <header className={styles.pageHeader}>
              <h1 className={styles.title}>2anki could not finish loading</h1>
              <p className={styles.subtitle}>
                Stored data from a past version is breaking this page. Reset to
                recover.
              </p>
            </header>

            {this.state.resetFailed && (
              <p className={styles.notificationDanger}>
                Couldn't reset local data. Clear site data for 2anki in your
                browser settings, then reload.
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

    return this.props.children;
  }
}
