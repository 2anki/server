import { useState } from "react";
import { Link, Route, Switch } from "react-router-dom";

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
              pathname: `/dashboard/${page.toLowerCase().replace(' ', '-')}`,
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
          <Switch>
            <Route exact path="/dashboard/logg-out" >
              page
            </Route>
            <Route path="/dashboard">
              <p className="subtitle">
                The dashboard is under development. <strong>Coming soon</strong>!
              </p>
            </Route>
          </Switch>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
