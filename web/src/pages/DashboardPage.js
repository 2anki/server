import { Link, Route, Switch } from "react-router-dom";
import { useState, useEffect } from "react";
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

const connectLink = () => {
  const redirectUri = encodeURIComponent("https://2anki.net/connect-notion");
  const notionClientID = "384c361a-dc51-4960-abc1-b1e76665f8da";
  return `https://api.notion.com/v1/oauth/authorize?client_id=${notionClientID}&redirect_uri=${redirectUri}&response_type=code`;
};

const DashboardPage = () => {
  const [menuItem, updateMenUItem] = useState(window.location.pathname);
  const [connected, updateConnected] = useState(false);

  const setMenuItem = async (item) => {
    if (item.includes("logg out")) {
      localStorage.removeItem("token");
      const endpoint = "/users/logout";
      await axios.get(endpoint, { withCredentials: true, credentials: true });
      window.location.href = "/";
    }
    updateMenUItem(item);
  };

  const [accessToken, setToken] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    let url = new URL(window.location.href);
    const codeParam = url.searchParams.get("code");
    if (codeParam) {
      localStorage.setItem("code", codeParam);
      localStorage.setItem("state", url.searchParams.get("state") || "");
    }
    setCode(localStorage.getItem("code") || "");
    setToken(localStorage.getItem("access_token") || "");
  }, []);

  const getNotionKey = () => {
    console.log("to be implemented");
    fetch("/auth/create-key", {
      headers: { code: code },
    }).then((response) => {
      response.json().then((payload) => {
        console.log(payload);
        for (const [key, value] of Object.entries(payload)) {
          // @ts-ignore
          localStorage.setItem(key, value);
          if (key === "access_token") {
            // @ts-ignore
            setToken(value);
          }
        }
      });
    });
  };


  return (
    <>
      {!connected && <div>
        {!code && <a className="button is-link has-text-weight-semibold	" href={connectLink()}>Connect to Notion</a>}
        {code && !accessToken && (
          <button onClick={() => getNotionKey()}>Get Notion Key</button>
        )}
        {code && accessToken && <p>Nothing to see here yet, move along ;-)</p>}
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
