import SearchContainer from './components/SearchContainer';
import useNotionData from './helpers/useNotionData';
import Backend from '../../lib/backend';
import ConnectNotion from './components/ConnectNotion';
import LoadingIndicator from '../../components/Loading';
import { ErrorHandlerType } from '../../components/errors/helpers/types';

interface SearchPageProps {
  setError: ErrorHandlerType;
}

const backend = new Backend();
function SearchPage({ setError }: SearchPageProps) {
  const notionData = useNotionData(backend);
  if (notionData.loading) {
    return <LoadingIndicator />;
  }

  const { connected, connectionLink } = notionData;

  return (
    <>
      {!connected && <ConnectNotion connectionLink={connectionLink} />}
      {connected && (
        <SearchContainer
          notionData={notionData}
          backend={backend}
          setError={setError}
        />
      )}
    </>
  );
}

export default SearchPage;
