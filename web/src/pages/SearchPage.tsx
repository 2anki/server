import { Route, Switch } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import Backend from "../lib/Backend";
import SearchBar from "../components/Dashboard/SearchBar";
import NavigationBar from "../components/NavigationBar";
import SearchObjectEntry from "../components/Dashboard/SearchObjectEntry";
import styled from "styled-components";
import LoadingScreen from "../components/LoadingScreen";

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
`;

const StyledSearchPage = styled.div`
  margin: 0 auto;
`;

let backend = new Backend();

const DashboardContent = () => {
  const [query, setQuery] = useState(localStorage.getItem("_query") || "");
  const [myPages, setMyPages] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [errorNotification, setError] = useState(null);
  const triggerSearch = useCallback(() => {
    if (inProgress) {
      return;
    }
    setError(null);
    setInProgress(true);
    backend
      .search(query)
      .then((results) => {
        setMyPages(results);
        setInProgress(false);
      })
      .catch((error) => {
        setInProgress(false);
        setError(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // TODO: warn user if they have more than 21 conversions active. Request deleting on /uploads
  return (
    <StyledSearchPage>
      <div className="column is-main-content">
        <Switch>
          <Route path="/search">
            <SearchBar
              inProgress={inProgress}
              onSearchQueryChanged={(s) => setQuery(s)}
              onSearchClicked={triggerSearch}
            />
            {(!myPages || myPages.length < 1) && (
              <EmptyContainer>
                {errorNotification && (
                  <div className="my-4 notification is-danger">
                    <p>{errorNotification.message}</p>
                  </div>
                )}
                {!errorNotification && (
                  <div className="subtitle is-3 my-4">
                    No search results, try typing something above 👌🏾
                  </div>
                )}
              </EmptyContainer>
            )}
            {myPages &&
              myPages.length > 0 &&
              myPages.map((p) => (
                <SearchObjectEntry
                  type={p.object}
                  key={p.url}
                  title={p.title}
                  icon={p.icon}
                  url={p.url}
                  id={p.id}
                />
              ))}
          </Route>
        </Switch>
      </div>
    </StyledSearchPage>
  );
};

const SearchPage = () => {
  const [connectionLink, updateConnectionLink] = useState("");
  const [connected, updateConnected] = useState(false);
  const [workSpace, setWorkSpace] = useState(
    localStorage.getItem("__workspace")
  );

  const [loading, setIsLoading] = useState(false);

  // TODO: this just be served up from the server (in-line)
  useEffect(() => {
    backend
      .getNotionConnectionInfo()
      .then((response) => {
        let data = response.data;
        if (data && !data.isConnected) {
          updateConnectionLink(data.link);
          updateConnected(data.isConnected);
        } else {
          updateConnectionLink(data.link);
          updateConnected(true);
        }
        // TODO: also load icon
        setWorkSpace(data.workspace);
        setIsLoading(false);
      })
      .catch((_error) => {
        window.location.href = "/login#login";
      });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NavigationBar activeWorkspace={workSpace} connectLink={connectionLink} />
      {!connected && (
        <div
          style={{
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
          className="column is-half is-centered"
        >
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
          <DashboardContent />
        </section>
      )}
    </>
  );
};

export default SearchPage;
