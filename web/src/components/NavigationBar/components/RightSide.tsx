import { ThemeSwitcher } from '../../ThemeSwitcher/ThemeSwitcher';
import NavbarItem from '../NavbarItem';
import { getVisibleText } from '../../../lib/text/getVisibleText';
import styles from '../NavigationBar.module.css';

interface RightSideProps {
  path: string;
}

export function RightSide({ path }: Readonly<RightSideProps>) {
  return (
    <div className={styles.navEnd}>
      <NavbarItem href="/upload" path={path}>
        {getVisibleText('navigation.upload')}
      </NavbarItem>
      <NavbarItem href="/print" path={path}>
        {getVisibleText('navigation.print')}
      </NavbarItem>
      <NavbarItem href="/documentation" path={path}>
        {getVisibleText('navigation.docs')}
      </NavbarItem>
      <NavbarItem href="/pricing" path={path}>
        {getVisibleText('navigation.pricing')}
      </NavbarItem>
      <ThemeSwitcher />
      <a className={styles.loginButton} href="/login#login">
        {getVisibleText('navigation.login')}
      </a>
    </div>
  );
}
