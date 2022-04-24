import { useCallback, useEffect, useState } from 'react';
import LoadingScreen from '../../../components/LoadingScreen';
import { PageContainer } from '../../../components/styled';
import Backend from '../../../lib/Backend';

import useQuery from '../../../lib/hooks/useQuery';
import { NotionData } from '../helpers/useNotionData';
import SearchPresenter from './SearchPresenter';
import WorkSpaceHeader from './WorkspaceHeader';

interface SearchContentProps {
  backend: Backend;
  notionData: NotionData;
}

export default function SearchContainer(props: SearchContentProps) {
  const query = useQuery();

  const [searchQuery, setSearchQuery] = useState(query.get('q') || '');
  const [myPages, setMyPages] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [errorNotification, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [favoritePages, setFavoritePages] = useState([]);

  const { backend, notionData } = props;

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
          // setFavoritePages(results.filter((page) => page.isFavorite));
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
    <PageContainer>
      <WorkSpaceHeader notionData={notionData} />
      <SearchPresenter
        setError={setError}
        myPages={myPages}
        inProgress={inProgress}
        setSearchQuery={setSearchQuery}
        triggerSearch={triggerSearch}
        errorNotification={errorNotification}
      />
    </PageContainer>
  );
}
