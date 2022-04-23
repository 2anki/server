import NotionObject from '../../../../lib/interfaces/NotionObject';
import MenuItem from './MenuItem';

interface MenuProps {
  favorites: NotionObject[];
}

/* eslint-disable jsx-a11y/anchor-is-valid */
export default function Menu(props: MenuProps) {
  const { favorites } = props;
  const path = window.location.pathname;

  return (
    <aside className="menu">
      {favorites.length > 0 && (
        <>
          <p className="menu-label">Favorites</p>
          <ul className="menu-list">
            {favorites.map((fav) => (
              <li key={fav.id}>
                <a href={fav.url}>{fav.title}</a>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="menu-label">Menu</p>
      <ul className="menu-list">
        <MenuItem name="Search" link="/search" currentPath={path} />
        <MenuItem name="Upload" link="/upload" currentPath={path} />
        <MenuItem name="Settings" link="/settings" currentPath={path} />
        <MenuItem name="My Uploads" link="/uploads/mine" currentPath={path} />
        <MenuItem
          name="Templates"
          link="https://templates.2anki.net"
          currentPath={path}
        />
      </ul>
      <p className="menu-label">More Coming Soon</p>
      <ul className="menu-list">
        <MenuItem name="Learn" link="/learn" currentPath={path} />
        <MenuItem name="Import" link="/import" currentPath={path} />
      </ul>
    </aside>
  );
}
