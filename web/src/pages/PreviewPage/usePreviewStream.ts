import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getPreviewBatch,
  PreviewBatch,
} from '../../lib/backend/getPreviewBatch';

export function usePreviewStream(pageId: string | undefined) {
  return useInfiniteQuery<PreviewBatch, Error>({
    queryKey: ['notionPreview', pageId],
    enabled: !!pageId,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      getPreviewBatch(pageId as string, pageParam as string | null),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}
