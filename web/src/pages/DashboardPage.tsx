import { Link, Route, Switch } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Backend from "../lib/Backend";
import SearchBar from "../components/Dashboard/SearchBar";
import SearchPageEntry from "../components/Dashboard/SearchPageEntry";
import Options from "../store/Options";

const generalPages = ["Workspaces", "Templates", "Settings"];
const accountPages = ["Logg out →"];
let backend = new Backend();

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
              decodeURIComponent(currentItem).endsWith(page.toLowerCase())
                ? "is-active"
                : ""
            }
          >
            {page}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const DashboardContent = () => {
  const [query, setQuery] = useState(localStorage.getItem("_query") || "");
  const [myPages, setMyPages] = useState(Options.LoadMyPages());
  const triggerSearch = () => {
    backend
      .search(query)
      .then((results) => {
        console.log("results", results);
        localStorage.setItem("__my_pages", JSON.stringify(results));
        setMyPages(results);
      })
      .catch((error) => {
        // TODO: handle this error
        console.error(error);
      });
  };
  useEffect(() => {
    if (query && query.length > 3) {
      // TODO: trigger search on type
      console.log(query);
    }
  }, [query]);

  return (
    <div className="column is-main-content">
      <Switch>
        <Route exact path="/dashboard/workspaces">
          Workspaces is coming soon!
        </Route>
        <Route path="/dashboard">
          <SearchBar
            onSearchQueryChanged={(s) => setQuery(s)}
            onSearchClicked={triggerSearch}
          />
          {myPages &&
            myPages.map((p) => (
              <SearchPageEntry
                key={p.url}
                title={p.title}
                icon={p.icon}
                url={p.url}
              />
            ))}
          <p className="subtitle">
            The dashboard is under development. <strong>Coming soon</strong>!
          </p>
        </Route>
      </Switch>
    </div>
  );
};

const DashboardPage = () => {
  const [connectionLink, updateConnectionLink] = useState("");
  const [connected, updateConnected] = useState(true);

  const [loading, setIsLoading] = useState(false);

  // TODO: this just be served up from the server (in-line)
  useEffect(() => {
    backend
      .getNotionConnectionInfo()
      .then((response) => {
        let data = response.data;
        console.log("data", data);
        if (data && !data.isConnected) {
          updateConnectionLink(data.link);
        } else if (data.isConnected) {
          updateConnected(data.isConnected);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        // TODO: better handle this
        // alert(
        //   "Failed to get Notion link, please refresh or contact developer: " +
        //     error.message
        // );
      });
  }, []);

  if (loading) {
    return <p>Loading ...</p>;
  }

  return (
    <>
      {!connected && (
        <div>
          <a
            className="button is-link has-text-weight-semibold	"
            href={connectionLink}
          >
            Connect to Notion
          </a>
        </div>
      )}
      {connected && (
        <section className="columns is-fullheight">
          {/* <SideBar menuItem={menuItem} setMenuItem={setMenuItem} /> */}
          <DashboardContent />
        </section>
      )}
    </>
  );
};

export default DashboardPage;
