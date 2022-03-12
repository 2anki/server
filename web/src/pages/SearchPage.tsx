import { Route, Switch, useHistory } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import Backend from '../lib/Backend';
import SearchBar from '../components/Dashboard/SearchBar';
import NavigationBar from '../components/NavigationBar';
import SearchObjectEntry from '../components/Dashboard/SearchObjectEntry';
import LoadingScreen from '../components/LoadingScreen';
import useQuery from '../lib/hooks/useQuery';

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
`;

const StyledSearchPage = styled.div`
  margin: 0 auto;
`;

const backend = new Backend();

function DashboardContent() {
  const query = useQuery();
  const history = useHistory();

  const [searchQuery, setSearchQuery] = useState(query.get('q') || '');
  const [myPages, setMyPages] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [errorNotification, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const triggerSearch = useCallback(
    (force) => {
      if (inProgress) {
        return;
      }
      setError(null);
      setInProgress(true);
      backend
        .search(searchQuery, force)
        .then((results) => {
          setMyPages(results);
          setInProgress(false);
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          setInProgress(false);
          setError(error);
        });
    },
    [inProgress, searchQuery],
  );

  useEffect(() => {
    setIsLoading(true);
    triggerSearch(true);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <StyledSearchPage>
      <div className="column is-main-content">
        <Switch>
          <Route path="/search">
            <SearchBar
              inProgress={inProgress}
              onSearchQueryChanged={(s) => {
                history.push({
                  pathname: '/search',
                  search: `?q=${s}`,
                });
                setSearchQuery(s);
              }}
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
            {myPages
              && myPages.length > 0
              && myPages.map((p) => (
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
}

function SearchPage() {
  const [connectionLink, updateConnectionLink] = useState('');
  const [connected, updateConnected] = useState(false);
  const [workSpace, setWorkSpace] = useState(
    localStorage.getItem('__workspace'),
  );

  const [loading, setIsLoading] = useState(false);

  // TODO: this just be served up from the server (in-line)
  useEffect(() => {
    backend
      .getNotionConnectionInfo()
      .then((response) => {
        const { data } = response;
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
      .catch(() => {
        window.location.href = '/login#login';
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
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
          className="column is-half is-centered"
        >
          <a
            className="button is-link has-text-weight-semibold"
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
}

export default SearchPage;
