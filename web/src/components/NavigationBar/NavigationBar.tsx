/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';

import styles from './NavigationBar.module.css';
import { RightSide } from './components/RightSide';
import useNavbarEnd from './helpers/useNavbarEnd';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';

interface NavigationBarProps {
  isLoggedIn: boolean | undefined;
}

function NavigationBar({ isLoggedIn }: Readonly<NavigationBarProps>) {
  const [active, setActive] = useState(false);
  const path = window.location.pathname;
  const loggedInNavbar = useNavbarEnd(path, get2ankiApi());

  const isResolved = isLoggedIn !== undefined;

  return (
    <nav className={styles.navbar} aria-label="main navigation">
      <div className={styles.brand}>
        <a className={styles.logoLink} href="/">
          <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
        </a>
        <button
          type="button"
          className={styles.burger}
          aria-label="menu"
          aria-expanded="false"
          onKeyDown={() => setActive(!active)}
          onClick={() => setActive(!active)}
          tabIndex={0}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div className={active ? styles.menuActive : styles.menu}>
        <div
          className={
            isResolved
              ? `${styles.navMenuContent} ${styles.navMenuContentVisible}`
              : styles.navMenuContent
          }
        >
          {isResolved &&
            (isLoggedIn ? loggedInNavbar : <RightSide path={path} />)}
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
