import { useCallback, useEffect, useState } from 'react';
import { ErrorHandlerType } from '../../../components/errors/helpers/types';

import Backend from '../../../lib/backend';
import useQuery from '../../../lib/hooks/useQuery';
import NotionObject from '../../../lib/interfaces/NotionObject';

export const QUERY_KEY = 'q';
interface SearchQuery {
  isLoading: boolean;
  myPages: NotionObject[];
  inProgress: boolean;
  triggerSearch: (force: boolean) => void;
  setSearchQuery: (value: string) => void;
}

export default function useSearchQuery(
  backend: Backend,
  setError: ErrorHandlerType
): SearchQuery {
  const query = useQuery();

  const [searchQuery, setSearchQuery] = useState<string>(
    query.get(QUERY_KEY) || ''
  );
  const [myPages, setMyPages] = useState<NotionObject[]>([]);
  const [inProgress, setInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const triggerSearch = useCallback(() => {
    if (inProgress) {
      return;
    }
    setInProgress(true);
    backend
      .search(searchQuery)
      .then((results) => {
        setMyPages(results);
        setInProgress(false);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
        setInProgress(false);
      });
  }, [inProgress, searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    triggerSearch();
  }, []);

  return {
    myPages,
    inProgress,
    triggerSearch,
    isLoading,
    setSearchQuery,
  };
}
