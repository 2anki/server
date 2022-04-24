import { NavigationBar } from '../../components/NavigationBar/NavigationBar';
import LoadingScreen from '../../components/LoadingScreen';
import SearchContainer from './components/SearchContainer';
import useNotionData from './helpers/useNotionData';
import Backend from '../../lib/Backend';
import ConnectNotion from './components/ConnectNotion';

const backend = new Backend();
function SearchPage() {
  const notionData = useNotionData(backend);
  if (notionData.loading) {
    return <LoadingScreen />;
  }

  const { workSpace, connected, connectionLink } = notionData;

  return (
    <>
      <NavigationBar activeWorkspace={workSpace} connectLink={connectionLink} />
      {!connected && <ConnectNotion connectionLink={connectionLink} />}
      {connected && <SearchContainer notionData={notionData} backend={backend} />}
    </>
  );
}

export default SearchPage;
