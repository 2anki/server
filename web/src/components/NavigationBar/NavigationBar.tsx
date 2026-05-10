import React, { useState } from 'react';

import styles from './NavigationBar.module.css';
import { RightSide } from './components/RightSide';
import { LoggedInNav } from './components/LoggedInNav';
import { AvatarMenu } from './components/AvatarMenu';
import { useUserLocals } from '../../lib/hooks/useUserLocals';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';

interface NavigationBarProps {
  isLoggedIn: boolean | undefined;
}

function NavigationBar({ isLoggedIn }: Readonly<NavigationBarProps>) {
  const [active, setActive] = useState(false);
  const path = globalThis.location.pathname;
  const { data } = useUserLocals();

  const isResolved = isLoggedIn !== undefined;
  const showLoggedInChrome = isResolved && isLoggedIn === true;

  const onLogOut = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    const confirmed = globalThis.confirm('Are you sure you want to log out?');
    if (!confirmed) return;
    get2ankiApi().logout();
  };

  return (
    <nav className={styles.navbar} aria-label="main navigation">
      <div className={styles.brand}>
        <a className={styles.logoLink} href="/">
          <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
        </a>
        <div className={styles.brandTriggers}>
          {showLoggedInChrome && (
            <AvatarMenu
              email={data?.user?.email}
              locals={data?.locals}
              features={data?.features}
              onLogOut={onLogOut}
            />
          )}
          <button
            type="button"
            className={styles.burger}
            aria-label="menu"
            aria-expanded={active}
            onClick={() => setActive(!active)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={active ? styles.menuActive : styles.menu}>
        {isResolved &&
          (isLoggedIn ? (
            <LoggedInNav path={path} locals={data?.locals} />
          ) : (
            <RightSide path={path} />
          ))}
      </div>

      {showLoggedInChrome && (
        <div className={styles.navAvatarDesktop}>
          <AvatarMenu
            email={data?.user?.email}
            locals={data?.locals}
            features={data?.features}
            onLogOut={onLogOut}
          />
        </div>
      )}
    </nav>
  );
}

export default NavigationBar;
