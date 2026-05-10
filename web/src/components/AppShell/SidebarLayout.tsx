import React, { ReactNode, Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarFeatures, SidebarLocals } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';
import { SkeletonPage } from '../Skeleton/Skeleton';
import { ErrorPresenter } from '../errors/ErrorPresenter';
import Footer from '../Footer';
import sharedStyles from '../../styles/shared.module.css';
import styles from './AppShell.module.css';

interface SidebarLayoutProps {
  email: string | null | undefined;
  locals: SidebarLocals | undefined | null;
  features: SidebarFeatures | undefined | null;
  isPaying?: boolean;
  onLogOut: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  error?: Error | null;
  children: ReactNode;
}

export function SidebarLayout({
  email,
  locals,
  features,
  isPaying,
  onLogOut,
  error,
  children,
}: Readonly<SidebarLayoutProps>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const [claudeEnabled, setClaudeEnabled] = useState(
    localStorage.getItem('claude-ai-flashcards') === 'true'
  );

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isDrawerOpen]);

  const showPromo = pathname === '/upload';
  const toggleClaude = () => {
    const next = !claudeEnabled;
    setClaudeEnabled(next);
    localStorage.setItem('claude-ai-flashcards', String(next));
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        email={email}
        locals={locals}
        features={features}
        onLogOut={onLogOut}
        onNavigate={() => setIsDrawerOpen(false)}
        isOpen={isDrawerOpen}
        drawerId="app-sidebar-drawer"
      />
      <button
        type="button"
        data-testid="sidebar-backdrop"
        aria-hidden={!isDrawerOpen}
        tabIndex={-1}
        className={isDrawerOpen ? styles.backdropVisible : styles.backdrop}
        onClick={() => setIsDrawerOpen(false)}
      />
      <div className={styles.main}>
        <MobileTopBar
          isOpen={isDrawerOpen}
          onOpen={() => setIsDrawerOpen(true)}
          onClose={() => setIsDrawerOpen(false)}
        />
        {isPaying && showPromo && (
          <div className={styles.claudePromoBanner}>
            <label className={sharedStyles.claudeLabel}>
              <input
                type="checkbox"
                checked={claudeEnabled}
                onChange={toggleClaude}
              />
              {' ✨ Generate flashcards with Claude AI'}
            </label>
          </div>
        )}
        {!isPaying && showPromo && (
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
    </div>
  );
}
