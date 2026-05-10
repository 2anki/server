import { useState } from 'react';

import styles from './NavigationBar.module.css';
import { RightSide } from './components/RightSide';

interface NavigationBarProps {
  isLoggedIn: boolean | undefined;
}

function NavigationBar({ isLoggedIn }: Readonly<NavigationBarProps>) {
  const [active, setActive] = useState(false);
  const path = globalThis.location.pathname;

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
          aria-expanded={active}
          onClick={() => setActive(!active)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div className={active ? styles.menuActive : styles.menu}>
        {isResolved && <RightSide path={path} />}
      </div>
    </nav>
  );
}

export default NavigationBar;
