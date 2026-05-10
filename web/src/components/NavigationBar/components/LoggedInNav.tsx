import { getVisibleText } from '../../../lib/text/getVisibleText';
import NavbarItem from '../NavbarItem';
import { isPayingUser } from '../helpers/getPlanLabel';
import styles from '../NavigationBar.module.css';

interface LoggedInNavLocals {
  patreon?: boolean;
  subscriber?: boolean;
}

interface LoggedInNavProps {
  path: string;
  locals: LoggedInNavLocals | undefined | null;
}

export function LoggedInNav({ path, locals }: Readonly<LoggedInNavProps>) {
  const showAnkify = locals?.patreon === true;
  const showPricing = !isPayingUser(locals);

  return (
    <div className={styles.navEnd}>
      <NavbarItem href="/upload" path={path}>
        {getVisibleText('navigation.upload')}
      </NavbarItem>
      <NavbarItem href="/downloads" path={path}>
        {getVisibleText('navigation.library')}
      </NavbarItem>
      <NavbarItem href="/notion" path={path}>
        {getVisibleText('navigation.search')}
      </NavbarItem>
      {showAnkify && (
        <NavbarItem href="/ankify" path={path}>
          Ankify
        </NavbarItem>
      )}
      <NavbarItem href="/documentation" path={path}>
        {getVisibleText('navigation.docs')}
      </NavbarItem>
      {showPricing && (
        <NavbarItem href="/pricing" path={path}>
          {getVisibleText('navigation.pricing')}
        </NavbarItem>
      )}
    </div>
  );
}
