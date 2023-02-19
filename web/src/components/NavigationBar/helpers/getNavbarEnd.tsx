import React from 'react';
import Backend from '../../../lib/backend';
import NavbarItem from '../NavbarItem';

export default function getNavbarEnd(path: string, backend: Backend) {
  const onLogOut = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    backend.logout();
  };
  return (
    <div className="navbar-end">
      <NavbarItem href="/search" path={path}>
        🔍 Search
      </NavbarItem>
      <NavbarItem path={path} href="/users/logout" onClick={onLogOut}>
        🔒 log out
      </NavbarItem>
      <NavbarItem path={path} href="/delete-account">🗑️ Delete account</NavbarItem>
    </div>
  );
}
