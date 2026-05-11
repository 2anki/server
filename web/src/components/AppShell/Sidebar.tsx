import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    <Link
      to={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`${styles.sidebarRow} ${
        active ? styles.sidebarRowActive : ''
      }`}
    >
      {children}
    </Link>
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
      <Link className={styles.sidebarLogo} to="/" onClick={handleNavClick()}>
        <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
      </Link>
      <div className={styles.sidebarGroup}>
        <div className={styles.sidebarGroupLabel}>
          {getVisibleText('navigation.groups.make')}
        </div>
        <SidebarRow
          href="/upload"
          pathname={pathname}
          matchPrefix={false}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.upload')}
        </SidebarRow>
        <SidebarRow
          href="/print"
          pathname={pathname}
          matchPrefix={false}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.print')}
        </SidebarRow>
        <SidebarRow
          href="/downloads"
          pathname={pathname}
          onClick={handleNavClick()}
        >
          {getVisibleText('navigation.conversions')}
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
      <div className={styles.sidebarGroup}>
        <div className={styles.sidebarGroupLabel}>
          {getVisibleText('navigation.groups.learn')}
        </div>
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
      </div>
      {showAdminGroup && (
        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarGroupLabel}>
            {getVisibleText('navigation.groups.admin')}
          </div>
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
      )}
      <div className={styles.sidebarSpacer} />
      <hr className={styles.sidebarDivider} />
      <Link
        className={styles.identity}
        to="/account"
        onClick={handleNavClick()}
      >
        <div className={styles.identityRow}>
          <span className={styles.identityEmail} title={email ?? undefined}>
            {email ?? 'Account'}
          </span>
          <span
            className={`${styles.identityPlan} ${
              isPayingUser(locals) ? styles.identityPlanPaid : ''
            }`}
          >
            {planLabel}
          </span>
        </div>
      </Link>
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
      <div className={styles.sidebarMore}>
        <div className={styles.sidebarMoreLinks}>
          <Link to="/about" onClick={handleNavClick()}>
            {getVisibleText('navigation.legal.about')}
          </Link>
          {' · '}
          <Link to="/contact" onClick={handleNavClick()}>
            {getVisibleText('navigation.contact')}
          </Link>
          {' · '}
          <Link
            to="/documentation/misc/terms-of-service"
            onClick={handleNavClick()}
          >
            {getVisibleText('navigation.legal.terms')}
          </Link>
          {' · '}
          <Link
            to="/documentation/misc/privacy-policy"
            onClick={handleNavClick()}
          >
            {getVisibleText('navigation.legal.privacy')}
          </Link>
        </div>
        <div className={styles.sidebarCopyright}>
          © 2024–{new Date().getFullYear()} Alexander Alemayhu
        </div>
      </div>
    </aside>
  );
}
