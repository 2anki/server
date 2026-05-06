import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getPreviewBatch,
  PreviewBatch,
} from '../../lib/backend/getPreviewBatch';

export function useBlockChildren(blockId: string, enabled: boolean) {
  return useInfiniteQuery<PreviewBatch, Error>({
    queryKey: ['notionPreviewChildren', blockId],
    enabled,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      getPreviewBatch(blockId, pageParam as string | null, {
        parentKind: 'block',
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    staleTime: 30_000,
  });
}
