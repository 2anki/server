import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../lib/hooks/useTheme';
import { getVisibleText } from '../../lib/text/getVisibleText';
import { getPlanLabel, isPayingUser } from '../NavigationBar/helpers/getPlanLabel';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import ArrowRightIcon from '../icons/ArrowRightIcon';
import ArrowRightOnRectangleIcon from '../icons/ArrowRightOnRectangleIcon';
import ArrowUpTrayIcon from '../icons/ArrowUpTrayIcon';
import BookOpenIcon from '../icons/BookOpenIcon';
import ChatBubbleIcon from '../icons/ChatBubbleIcon';
import RectangleGroupIcon from '../icons/RectangleGroupIcon';
import LayersIcon from '../icons/LayersIcon';
import CommandLineIcon from '../icons/CommandLineIcon';
import CreditCardIcon from '../icons/CreditCardIcon';
import PrinterIcon from '../icons/PrinterIcon';
import SparklesIcon from '../icons/SparklesIcon';
import UserCircleIcon from '../icons/UserCircleIcon';
import SettingsIcon from '../icons/SettingsIcon';
import WrenchIcon from '../icons/WrenchIcon';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import styles from './AppShell.module.css';

const TRIAL_DURATION_MS = 60 * 60 * 1000;

function useTrialCountdown(trialStartedAt: string | null | undefined): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (trialStartedAt == null) {
      setLabel(null);
      return;
    }
    const startedAt = new Date(trialStartedAt).getTime();

    function tick() {
      const remaining = startedAt + TRIAL_DURATION_MS - Date.now();
      if (remaining <= 0) {
        setLabel(null);
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      setLabel(`Unlimited · ${minutes}m left`);
    }

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [trialStartedAt]);

  return label;
}

export interface SidebarLocals {
  patreon?: boolean;
  subscriber?: boolean;
  trial_started_at?: string | null;
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
  icon?: React.ComponentType<{ width?: number; height?: number }>;
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
  icon: Icon,
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
      {Icon && <Icon width={20} height={20} />}
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
  const theme = useTheme();
  const logoSrc = theme === 'light' ? '/mascot/navbar-logo.png' : '/mascot/Notion 1.png';
  const showAnkify = locals?.patreon === true;
  const paying = isPayingUser(locals);
  const showPricing = !paying;
  const showKi = features?.kiUI === true;
  const showOps = features?.ops === true;
  const showAdminGroup = showKi || showOps;
  const trialCountdown = useTrialCountdown(locals?.trial_started_at);
  const planLabel = trialCountdown ?? getPlanLabel(locals);

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
        <img src={logoSrc} alt="2anki Logo" />
      </Link>
      <nav className={styles.sidebarNav}>
        <div className={styles.sidebarGroup}>
          <SidebarRow
            href="/upload"
            pathname={pathname}
            matchPrefix={false}
            onClick={handleNavClick()}
            icon={ArrowUpTrayIcon}
          >
            {getVisibleText('navigation.upload')}
          </SidebarRow>
          <SidebarRow
            href="/notion"
            pathname={pathname}
            onClick={handleNavClick()}
            icon={ArrowRightIcon}
          >
            Notion to Anki
          </SidebarRow>
          <SidebarRow
            href="/import"
            pathname={pathname}
            matchPrefix={false}
            onClick={handleNavClick()}
            icon={ArrowLeftIcon}
          >
            Anki to Notion
          </SidebarRow>
          <SidebarRow
            href="/image-occlusion"
            pathname={pathname}
            matchPrefix={false}
            onClick={handleNavClick()}
            icon={RectangleGroupIcon}
          >
            Image Occlusion
          </SidebarRow>
          <SidebarRow
            href="/chat"
            pathname={pathname}
            matchPrefix={false}
            onClick={handleNavClick()}
            icon={ChatBubbleIcon}
          >
            Chat
          </SidebarRow>
          {paying && (
            <SidebarRow
              href="/print"
              pathname={pathname}
              matchPrefix={false}
              onClick={handleNavClick()}
              icon={PrinterIcon}
            >
              {getVisibleText('navigation.print')}
            </SidebarRow>
          )}
          {showAnkify && (
            <SidebarRow
              href="/ankify"
              pathname={pathname}
              onClick={handleNavClick()}
              icon={SparklesIcon}
            >
              Auto Sync
            </SidebarRow>
          )}
        </div>
        <div className={styles.sidebarGroup}>
          <SidebarRow
            href="/downloads"
            pathname={pathname}
            onClick={handleNavClick()}
            icon={LayersIcon}
          >
            {getVisibleText('navigation.myDecks')}
          </SidebarRow>
          <SidebarRow
            href="/card-options"
            pathname={pathname}
            matchPrefix={false}
            onClick={handleNavClick()}
            icon={SettingsIcon}
          >
            Card options
          </SidebarRow>
        </div>
        <div className={styles.sidebarGroup}>
          <SidebarRow
            href="/documentation"
            pathname={pathname}
            onClick={handleNavClick()}
            icon={BookOpenIcon}
          >
            {getVisibleText('navigation.docs')}
          </SidebarRow>
          {showPricing && (
            <SidebarRow
              href="/pricing"
              pathname={pathname}
              matchPrefix={false}
              onClick={handleNavClick()}
              icon={CreditCardIcon}
            >
              {getVisibleText('navigation.pricing')}
            </SidebarRow>
          )}
        </div>
        {showAdminGroup && (
          <div className={styles.sidebarGroup}>
            {showKi && (
              <SidebarRow
                href="/ki"
                pathname={pathname}
                onClick={handleNavClick()}
                icon={CommandLineIcon}
              >
                KI
              </SidebarRow>
            )}
            {showOps && (
              <SidebarRow
                href="/ops"
                pathname={pathname}
                onClick={handleNavClick()}
                icon={WrenchIcon}
              >
                Ops
              </SidebarRow>
            )}
          </div>
        )}
      </nav>
      <div className={styles.sidebarTheme}>
        <ThemeSwitcher />
      </div>
      <div className={styles.sidebarSpacer} />
      <div className={styles.identity}>
        <span className={styles.identityEmail} title={email ?? undefined}>
          {email ?? 'Account'}
        </span>
        <span className={styles.identityPlan}>{planLabel}</span>
      </div>
      <div className={styles.sidebarGroup}>
        <SidebarRow
          href="/account"
          pathname={pathname}
          matchPrefix={false}
          onClick={handleNavClick()}
          icon={UserCircleIcon}
        >
          {getVisibleText('navigation.account')}
        </SidebarRow>
        <a
          className={styles.sidebarRow}
          href="/users/logout"
          onClick={handleNavClick(onLogOut)}
        >
          <ArrowRightOnRectangleIcon width={20} height={20} />
          {getVisibleText('navigation.logout')}
        </a>
      </div>
      <div className={styles.sidebarMore}>
        <div className={styles.sidebarMoreLinks}>
          <Link to="/whats-new" onClick={handleNavClick()}>
            What's new
          </Link>
          <Link to="/contact" onClick={handleNavClick()}>
            {getVisibleText('navigation.contact')}
          </Link>
          <Link
            to="/documentation/misc/privacy-policy"
            onClick={handleNavClick()}
          >
            {getVisibleText('navigation.legal.privacy')}
          </Link>
          <Link
            to="/documentation/misc/terms-of-service"
            onClick={handleNavClick()}
          >
            {getVisibleText('navigation.legal.terms')}
          </Link>
          <Link to="/about" onClick={handleNavClick()}>
            {getVisibleText('navigation.legal.about')}
          </Link>
        </div>

      </div>
    </aside>
  );
}
