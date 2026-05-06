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
      <NavbarItem path="pricing" href="/pricing">
        {getVisibleText('navigation.pricing')}
      </NavbarItem>
      <a className={styles.loginButton} href="/login#login">
        {getVisibleText('navigation.login')}
      </a>
    </div>
  );
}
