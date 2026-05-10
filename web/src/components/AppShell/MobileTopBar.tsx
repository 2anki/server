import styles from './AppShell.module.css';

interface MobileTopBarProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function MobileTopBar({
  isOpen,
  onOpen,
  onClose,
}: Readonly<MobileTopBarProps>) {
  const onClick = isOpen ? onClose : onOpen;
  return (
    <div className={styles.mobileTopBar}>
      <button
        type="button"
        className={styles.mobileBurger}
        aria-label="Open navigation"
        aria-expanded={isOpen}
        aria-controls="app-sidebar-drawer"
        onClick={onClick}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <a className={styles.mobileLogo} href="/">
        <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
      </a>
      <span aria-hidden="true" />
    </div>
  );
}
