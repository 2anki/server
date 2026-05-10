import React from 'react';
import { useLocation } from 'react-router-dom';
import { getVisibleText } from '../../lib/text/getVisibleText';
import { getPlanLabel, isPayingUser } from '../NavigationBar/helpers/getPlanLabel';
import styles from './AppShell.module.css';

export interface SidebarLocals {
  patreon?: boolean;
  subscriber?: boolean;
}

export interface SidebarFeatures {
  kiUI?: boolean;
  ops?: boolean;
}

interface SidebarProps {
  email: string | null | undefined;
  locals: SidebarLocals | undefined | null;
  features: SidebarFeatures | undefined | null;
  onLogOut: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  onNavigate?: () => void;
  isOpen?: boolean;
  drawerId?: string;
}

interface SidebarRowProps {
  href: string;
  pathname: string;
  matchPrefix?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
}

function isActiveRoute(pathname: string, href: string, matchPrefix: boolean) {
  if (pathname === href) return true;
  if (!matchPrefix) return false;
  return pathname.startsWith(`${href}/`);
}

function SidebarRow({
  href,
  pathname,
  matchPrefix = true,
  onClick,
  children,
}: Readonly<SidebarRowProps>) {
  const active = isActiveRoute(pathname, href, matchPrefix);
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`${styles.sidebarRow} ${
        active ? styles.sidebarRowActive : ''
      }`}
    >
      {children}
    </a>
  );
}

export function Sidebar({
  email,
  locals,
  features,
  onLogOut,
  onNavigate,
  isOpen = false,
  drawerId,
}: Readonly<SidebarProps>) {
  const { pathname } = useLocation();
  const showAnkify = locals?.patreon === true;
  const paying = isPayingUser(locals);
  const showPricing = !paying;
  const showBilling = paying;
  const showKi = features?.kiUI === true;
  const showOps = features?.ops === true;
  const showAdminGroup = showKi || showOps;
  const planLabel = getPlanLabel(locals);

  const handleNavClick = (
    handler?: React.MouseEventHandler<HTMLAnchorElement>
  ): React.MouseEventHandler<HTMLAnchorElement> => {
    return (event) => {
      onNavigate?.();
      handler?.(event);
    };
  };

  return (
    <aside
      id={drawerId}
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
      aria-label="primary"
      data-testid="app-sidebar"
    >
      <a className={styles.sidebarLogo} href="/" onClick={handleNavClick()}>
        <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
      </a>
      <hr className={styles.sidebarDivider} />
      <div className={styles.sidebarGroup}>
        <SidebarRow
          href="/upload"
          pathname={pathname}
          matchPrefix={false}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.upload')}
        </SidebarRow>
        <SidebarRow
          href="/downloads"
          pathname={pathname}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.library')}
        </SidebarRow>
        <SidebarRow
          href="/notion"
          pathname={pathname}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.searchNotion')}
        </SidebarRow>
        {showAnkify && (
          <SidebarRow
            href="/ankify"
            pathname={pathname}
            onClick={handleNavClick()}
          >
            Ankify
          </SidebarRow>
        )}
      </div>
      <hr className={styles.sidebarDivider} />
      <div className={styles.sidebarGroup}>
        <SidebarRow
          href="/documentation"
          pathname={pathname}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.docs')}
        </SidebarRow>
        {showPricing && (
          <SidebarRow
            href="/pricing"
            pathname={pathname}
            matchPrefix={false}
            onClick={handleNavClick()}
          >
            {getVisibleText('navigation.pricing')}
          </SidebarRow>
        )}
        {showBilling && (
          <SidebarRow
            href="/account"
            pathname={pathname}
            matchPrefix={false}
            onClick={handleNavClick()}
          >
            {getVisibleText('navigation.billing')}
          </SidebarRow>
        )}
      </div>
      {showAdminGroup && (
        <>
          <hr className={styles.sidebarDivider} />
          <div className={styles.sidebarGroup}>
            {showKi && (
              <SidebarRow
                href="/ki"
                pathname={pathname}
                onClick={handleNavClick()}
              >
                KI (beta)
              </SidebarRow>
            )}
            {showOps && (
              <SidebarRow
                href="/ops"
                pathname={pathname}
                onClick={handleNavClick()}
              >
                Ops
              </SidebarRow>
            )}
          </div>
        </>
      )}
      <div className={styles.sidebarSpacer} />
      <hr className={styles.sidebarDivider} />
      <a
        className={styles.identity}
        href="/account"
        onClick={handleNavClick()}
      >
        <div className={styles.identityRow}>
          <span className={styles.identityEmail} title={email ?? undefined}>
            {email ?? 'Account'}
          </span>
          <span className={styles.identityPlan}>{planLabel}</span>
        </div>
      </a>
      <div className={styles.sidebarGroup}>
        <SidebarRow
          href="/account"
          pathname={pathname}
          matchPrefix={false}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.account')}
        </SidebarRow>
        <a
          className={styles.sidebarRow}
          href="/users/logout"
          onClick={handleNavClick(onLogOut)}
        >
          {getVisibleText('navigation.logout')}
        </a>
      </div>
    </aside>
  );
}
