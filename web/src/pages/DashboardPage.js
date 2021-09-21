import { useState } from "react";
import { Link } from "react-router-dom";

const generalPages = ["Workspaces", "Templates", "Settings"];

const accountPages = ["Billing", "Logg out"];

const MenuList = ({ pages, currentItem, setCurrentMenuItem }) => {
  return (
    <ul className="menu-list">
      {pages.map((page) => (
        <li
          key={page}
          className="menu-item"
          onClick={() => setCurrentMenuItem(page.toLowerCase())}
        >
          <Link
            to={{
              pathname: `/dashboard/${page.toLowerCase()}`,
              state: { currentItem },
            }}
            className={
              currentItem.endsWith(page.toLowerCase()) ? "is-active" : ""
            }
          >
            {page}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const DashboardPage = () => {
  const [menuItem, setMenuItem] = useState(window.location.pathname);

  return (
    <>
      <div className="columns is-fullheight">
        <div className="column is-2 is-sidebar-menu is-hidden-mobile">
          <aside className="menu">
            <p className="menu-label">General</p>
            <MenuList
              pages={generalPages}
              currentItem={menuItem}
              setCurrentMenuItem={setMenuItem}
            />
            <p className="menu-label">Account</p>
            <MenuList pages={accountPages} currentItem={menuItem} setCurrentMenuItem={setMenuItem} />
          </aside>
        </div>
        <div className="column is-main-content">
          <p className="subtitle">
            The dashboard is under development. <strong>Coming soon</strong>!
          </p>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
