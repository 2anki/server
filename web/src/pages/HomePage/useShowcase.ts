import { useQuery } from '@tanstack/react-query';
import { getShowcase, ShowcaseData } from '../../lib/backend/getShowcase';

export function useShowcase() {
  return useQuery<ShowcaseData | null>({
    queryKey: ['homepage-showcase'],
    queryFn: getShowcase,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
