import Backend from '../../../lib/Backend';
import NavbarItem from '../NavbarItem';

export default function getNavbarEnd(path: string, backend: Backend) {
  return (
    <div className="navbar-end">
      <NavbarItem href="/search" path={path}>
        🔍 Search
      </NavbarItem>
      <NavbarItem
        path={path}
        href="/users/logout"
        onClick={(event) => {
          event.preventDefault();
          backend.logout();
        }}
      >
        🔒 log out
      </NavbarItem>
    </div>
  );
}
