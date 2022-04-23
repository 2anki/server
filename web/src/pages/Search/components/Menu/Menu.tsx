interface MenuProps {
  favorites: string[];
}

/* eslint-disable jsx-a11y/anchor-is-valid */
export default function Menu(props: MenuProps) {
  const { favorites } = props;
  return (
    <aside className="menu">
      {favorites.length > 0
      && (
      <>
        <p className="menu-label">Favorites</p>
        <ul className="menu-list">
          {favorites.map((id) => (
            <li key={id}>
              <a href={id}>{id}</a>
            </li>
          ))}
        </ul>
      </>
      )}
      <p className="menu-label">Menu</p>
      <ul className="menu-list">
        <li>
          <a href="#">Search</a>
        </li>
        <li>
          <a href="/upload">File upload</a>
        </li>
        <li>
          <a href="/settings">Settings</a>
        </li>
        <li>
          <a href="/uploads/mine">Uploads</a>
        </li>
        <li>
          <a href="https://templates.2anki.net">Templates</a>
        </li>
      </ul>
      <p className="menu-label">Coming Soon</p>
      <ul className="menu-list">
        <li>
          <a href="/learn">
            Learn
            {' '}
          </a>
        </li>
        <li><a href="/import">Import</a></li>
      </ul>
    </aside>
  );
}
