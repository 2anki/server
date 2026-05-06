import { useCallback, useEffect, useState } from 'react';
import { ErrorHandlerType } from '../../../components/errors/helpers/getErrorMessage';

import Backend from '../../../lib/backend';
import useQuery from '../../../lib/hooks/useQuery';
import NotionObject from '../../../lib/interfaces/NotionObject';

export const QUERY_KEY = 'q';
export const SESSION_STORAGE_KEY = 'search-query';
interface SearchQuery {
  isLoading: boolean;
  myPages: NotionObject[];
  inProgress: boolean;
  triggerSearch: (force: boolean) => void;
  setSearchQuery: (value: string) => void;
  searchQuery: string;
}

const DEBOUNCE_MS = 600;

export default function useSearchQuery(
  backend: Backend,
  setError: ErrorHandlerType
): SearchQuery {
  const query = useQuery();

  const [searchQuery, setSearchQuery] = useState<string>(
    query.get(QUERY_KEY) ||
      sessionStorage.getItem(SESSION_STORAGE_KEY) ||
      'anki'
  );

  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
    setMyPages([]);
    setInProgress(true);
    sessionStorage.setItem(SESSION_STORAGE_KEY, value);
  }, []);
  const [myPages, setMyPages] = useState<NotionObject[]>([]);
  const [inProgress, setInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const triggerSearch = useCallback(() => {
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
  }, [searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    triggerSearch();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      triggerSearch();
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchQuery, triggerSearch]);

  return {
    myPages,
    inProgress,
    triggerSearch,
    isLoading,
    setSearchQuery: updateSearchQuery,
    searchQuery,
  };
}
