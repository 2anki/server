import { ReactNode, Suspense } from 'react';
import { ErrorPresenter } from '../errors/ErrorPresenter';
import NavigationBar from '../NavigationBar/NavigationBar';
import Footer from '../Footer';
import { SkeletonPage } from '../Skeleton/Skeleton';
import { EmailVerificationBanner } from '../EmailVerificationBanner/EmailVerificationBanner';
import sharedStyles from '../../styles/shared.module.css';
import styles from './Layout.module.css';

interface PageLayoutProps {
  isLoggedIn: boolean | undefined;
  children: ReactNode;
  error?: Error | null;
}

export function PageLayout({
  children,
  error,
  isLoggedIn,
}: Readonly<PageLayoutProps>) {
  return (
    <div className={styles.pageContent}>
      <NavigationBar isLoggedIn={isLoggedIn} />
      <EmailVerificationBanner />
      {error && <ErrorPresenter error={error} />}
      <main className={sharedStyles.flexGrow}>
        <Suspense fallback={<SkeletonPage rows={5} />}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
