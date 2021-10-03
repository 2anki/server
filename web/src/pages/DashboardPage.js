import { Link, Route, Switch } from "react-router-dom";
import { useEffect, useState } from "react";
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

const SideBar = (menuItem, setMenuItem) => {
  return <div className="column is-2 is-sidebar-menu is-hidden-mobile">
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
  </div>;
};

const DashboardContent = () => {
  return <div className="column is-main-content">
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
  </div>;
};


const DashboardPage = () => {
  const [menuItem, updateMenUItem] = useState(window.location.pathname);
  const [connectionLink, updateConnectionLink] = useState("");
  const [connected, updateConnected] = useState(false);

  const [loading, setIsLoading] = useState(true);

  const setMenuItem = async (item) => {
    if (item.includes("logg out")) {
      localStorage.removeItem("token");
      const endpoint = "/users/logout";
      await axios.get(endpoint, { withCredentials: true, credentials: true });
      window.location.href = "/";
    }
    updateMenUItem(item);
  };

  // TODO: this just be served up from the server (in-line)
  useEffect(() => {
    const endpoint = "/notion/get-notion-link";
    axios.get(endpoint)
      .then(response => {
        let data = response.data;
        if (data && !data.isConnected) {
          updateConnectionLink(data.link);
          setIsLoading(false);
        } else if (data.isConnected) {
          updateConnected(data.isConnected);
        }
      }
      ).catch(error => { // TODO: better handle this
        alert("Failed to get Notion link, please refresh or contact developer: " + error.message);
      });
  }, []);

  if (loading) {
    return <p>Loading ...</p>;
  }

  return (
    <>
      {!connected && <div>
        <a className="button is-link has-text-weight-semibold	" href={connectionLink}>Connect to Notion</a>
      </div>}
      {connected &&
        <section className="columns is-fullheight">
          <SideBar menuItem={menuItem} setMenuItem={setMenuItem} />
          <DashboardContent />
        </section>
      }
    </>
  );
};

export default DashboardPage;
