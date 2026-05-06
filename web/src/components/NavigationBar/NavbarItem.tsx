import React from 'react';
import styles from './NavigationBar.module.css';

export interface NavbarItemProps {
  path: string;
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
}

export default function NavbarItem({
  path,
  href,
  onClick,
  children,
}: NavbarItemProps) {
  return (
    <a
      onClick={onClick}
      href={href}
      className={`${styles.navLink} ${
        path === href ? styles.navLinkActive : ''
      }`}
    >
      {children}
    </a>
  );
}
