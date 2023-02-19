import { QUERY_KEY } from './useSearchQuery';

export const getQueryValue = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get(QUERY_KEY) as string;
};