import { useQuery } from '@tanstack/react-query';
import { get2ankiApi } from '../backend/get2ankiApi';

export function useFavoritesCount(enabled: boolean): number {
  const { data } = useQuery({
    queryKey: ['favoritesCount'],
    queryFn: async () => {
      const favorites = await get2ankiApi().getFavorites();
      return favorites.length;
    },
    enabled,
    staleTime: 60_000,
  });

  return data ?? 0;
}
