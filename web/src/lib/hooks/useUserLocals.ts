import { useQuery } from '@tanstack/react-query';

import { getUserLocals } from '../backend/getUserLocals';

export function useUserLocals() {
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['userLocals'],
    queryFn: getUserLocals,
    retry: 3,
    retryDelay: 1000,
  });

  return { data, isLoading, error, isError, refetch };
}
