import { Link, Route, Switch } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const generalPages = ["Workspaces", "Templates", "Settings"];

const accountPages = ["Logg out →"];

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
              decodeURIComponent(currentItem).endsWith(page.toLowerCase()) ? "is-active" : ""
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
  const [menuItem, updateMenUItem] = useState(window.location.pathname);

  const setMenuItem = async (item) => {
    if (item.includes("logg out")) {
      localStorage.removeItem("token");
      const endpoint = "/users/logout";
      await axios.get(endpoint, { withCredentials: true, credentials: true });
      window.location.href = "/";
    }
    updateMenUItem(item);
  };

  return (
    <>
      <section className="columns is-fullheight">
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
            <Route exact path="/dashboard/workspaces" >
              Workspaces is coming soon!
            </Route>
            <Route path="/dashboard">
              <p className="subtitle">
                The dashboard is under development. <strong>Coming soon</strong>!
              </p>
            </Route>
          </Switch>
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
