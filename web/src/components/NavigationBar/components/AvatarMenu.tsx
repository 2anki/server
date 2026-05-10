import React, { useEffect, useId, useRef, useState } from 'react';
import { getVisibleText } from '../../../lib/text/getVisibleText';
import { getAvatarInitial } from '../helpers/getAvatarInitial';
import { getPlanLabel, isPayingUser } from '../helpers/getPlanLabel';
import styles from '../NavigationBar.module.css';

interface AvatarMenuLocals {
  patreon?: boolean;
  subscriber?: boolean;
}

interface AvatarMenuFeatures {
  kiUI?: boolean;
  ops?: boolean;
}

interface AvatarMenuProps {
  email: string | null | undefined;
  locals: AvatarMenuLocals | undefined | null;
  features: AvatarMenuFeatures | undefined | null;
  onLogOut: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export function AvatarMenu({
  email,
  locals,
  features,
  onLogOut,
}: Readonly<AvatarMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const initial = getAvatarInitial(email);
  const planLabel = getPlanLabel(locals);
  const paying = isPayingUser(locals);
  const showKi = features?.kiUI === true;
  const showOps = features?.ops === true;
  const showExperiments = showKi;
  const showAdmin = showOps;

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      ) ?? []
    );
    if (items.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? items.indexOf(active) : -1;
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + delta + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <div className={styles.dropdown} ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        className={styles.avatarToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label="Account menu"
      >
        <span className={styles.avatarCircle} aria-hidden="true">
          {initial}
        </span>
        <span className={styles.avatarCaret} aria-hidden="true">
          ▾
        </span>
      </button>
      <div
        id={menuId}
        className={`${styles.dropdownMenu} ${
          isOpen ? styles.dropdownMenuActive : ''
        }`}
        role="menu"
        onKeyDown={onMenuKeyDown}
      >
        <div className={styles.dropdownHeader}>
          {email && <div className={styles.dropdownEmail}>{email}</div>}
          <div className={styles.dropdownPlan}>{planLabel}</div>
        </div>
        <hr className={styles.dropdownDivider} />
        <a
          className={styles.dropdownItem}
          href="/account"
          role="menuitem"
          onClick={close}
        >
          {getVisibleText('navigation.account')}
        </a>
        {paying && (
          <a
            className={styles.dropdownItem}
            href="/account"
            role="menuitem"
            onClick={close}
          >
            {getVisibleText('navigation.billing')}
          </a>
        )}
        {showExperiments && (
          <>
            <hr className={styles.dropdownDivider} />
            <div className={styles.dropdownSubhead}>
              {getVisibleText('navigation.experiments')}
            </div>
            {showKi && (
              <a
                className={styles.dropdownItem}
                href="/ki"
                role="menuitem"
                onClick={close}
              >
                KI (beta)
              </a>
            )}
          </>
        )}
        {showAdmin && (
          <>
            <hr className={styles.dropdownDivider} />
            <div className={styles.dropdownSubhead}>
              {getVisibleText('navigation.admin')}
            </div>
            {showOps && (
              <a
                className={styles.dropdownItem}
                href="/ops"
                role="menuitem"
                onClick={close}
              >
                Ops
              </a>
            )}
          </>
        )}
        <hr className={styles.dropdownDivider} />
        <a
          className={styles.dropdownItem}
          href="/users/logout"
          role="menuitem"
          onClick={onLogOut}
        >
          {getVisibleText('navigation.logout')}
        </a>
      </div>
    </div>
  );
}
