import { useCallback, useEffect, useState } from 'react';
import LoadingScreen from '../../../components/LoadingScreen';
import Backend from '../../../lib/Backend';

import useQuery from '../../../lib/hooks/useQuery';
import SearchPresenter from './SearchPresenter';

interface SearchContentProps {
  backend: Backend;
}

export default function SearchContent(props: SearchContentProps) {
  const query = useQuery();

  const [searchQuery, setSearchQuery] = useState(query.get('q') || '');
  const [myPages, setMyPages] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [errorNotification, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favoritePages, setFavoritePages] = useState([]);

  const { backend } = props;

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
          setFavoritePages(results.filter((page) => page.isFavorite));
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
    <SearchPresenter
      setError={setError}
      myPages={myPages}
      inProgress={inProgress}
      favorites={favoritePages}
      setSearchQuery={setSearchQuery}
      triggerSearch={triggerSearch}
      errorNotification={errorNotification}
    />
  );
}
