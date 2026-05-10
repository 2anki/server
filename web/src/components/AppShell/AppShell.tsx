import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PageLayout } from '../Layout/PageLayout';
import { SidebarLayout } from './SidebarLayout';
import { SidebarFeatures, SidebarLocals } from './Sidebar';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';

const TOP_BAR_PATHS = ['/login', '/register', '/forgot'];
const TOP_BAR_PREFIXES = ['/users/r/'];

function shouldForceTopBar(pathname: string): boolean {
  if (TOP_BAR_PATHS.includes(pathname)) return true;
  return TOP_BAR_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

interface AppShellProps {
  isLoggedIn: boolean | undefined;
  isPaying: boolean;
  email: string | null | undefined;
  locals: SidebarLocals | undefined | null;
  features: SidebarFeatures | undefined | null;
  error?: Error | null;
  children: ReactNode;
}

export function AppShell({
  isLoggedIn,
  isPaying,
  email,
  locals,
  features,
  error,
  children,
}: Readonly<AppShellProps>) {
  const { pathname } = useLocation();

  const onLogOut = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    const confirmed = globalThis.confirm('Are you sure you want to log out?');
    if (!confirmed) return;
    get2ankiApi().logout();
  };

  const useSidebar = isLoggedIn === true && !shouldForceTopBar(pathname);

  if (useSidebar) {
    return (
      <SidebarLayout
        email={email}
        locals={locals}
        features={features}
        isPaying={isPaying}
        onLogOut={onLogOut}
        error={error}
      >
        {children}
      </SidebarLayout>
    );
  }

  return (
    <PageLayout error={error} isLoggedIn={isLoggedIn}>
      {children}
    </PageLayout>
  );
}
