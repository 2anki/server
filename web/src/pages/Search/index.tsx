import { useEffect, useState } from 'react';

import Backend from '../../lib/Backend';
import { NavigationBar } from '../../components/NavigationBar/NavigationBar';
import LoadingScreen from '../../components/LoadingScreen';
import SearchContainer from './components/SearchContainer';

function SearchPage() {
  const [connectionLink, updateConnectionLink] = useState('');
  const [connected, updateConnected] = useState(false);
  const [workSpace, setWorkSpace] = useState(
    localStorage.getItem('__workspace'),
  );
  const backend = new Backend();
  const [loading, setIsLoading] = useState(false);

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
        <SearchContainer backend={backend} />
      )}
    </>
  );
}

export default SearchPage;
