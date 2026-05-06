import { ReactNode, Suspense, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ErrorPresenter } from '../errors/ErrorPresenter';
import NavigationBar from '../NavigationBar/NavigationBar';
import Footer from '../Footer';
import { SkeletonPage } from '../Skeleton/Skeleton';
import sharedStyles from '../../styles/shared.module.css';
import styles from './Layout.module.css';

interface PageLayoutProps {
  isLoggedIn: boolean | undefined;
  isPaying: boolean;
  children: ReactNode;
  error?: Error | null;
}

export function PageLayout({
  children,
  error,
  isLoggedIn,
  isPaying,
}: Readonly<PageLayoutProps>) {
  const [claudeEnabled, setClaudeEnabled] = useState(
    localStorage.getItem('claude-ai-flashcards') === 'true'
  );
  const { pathname } = useLocation();
  const showPromo = pathname === '/upload';

  const toggleClaude = () => {
    const next = !claudeEnabled;
    setClaudeEnabled(next);
    localStorage.setItem('claude-ai-flashcards', String(next));
  };

  return (
    <div className={styles.pageContent}>
      <NavigationBar isLoggedIn={isLoggedIn} />
      {isLoggedIn && isPaying && showPromo && (
        <div className={styles.claudePromoBanner}>
          <label className={sharedStyles.claudeLabel}>
            <input
              type="checkbox"
              checked={claudeEnabled}
              onChange={toggleClaude}
            />
            ✨ Generate flashcards with Claude AI
          </label>
        </div>
      )}
      {isLoggedIn && !isPaying && showPromo && (
        <div className={styles.claudePromoBanner}>
          ✨{' '}
          <span>
            Subscribers can generate flashcards with Claude AI for better
            results. <Link to="/pricing">Upgrade your plan</Link>
          </span>
        </div>
      )}
      {error && <ErrorPresenter error={error} />}
      <main className={sharedStyles.flexGrow}>
        <Suspense fallback={<SkeletonPage rows={5} />}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
