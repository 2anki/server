import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  ApkgPreviewBatch,
  ApkgPreviewMeta,
  getApkgPreviewBatch,
  getApkgPreviewMeta,
} from '../../lib/backend/getApkgPreview';

export function useApkgPreviewMeta(key: string | undefined) {
  return useQuery<ApkgPreviewMeta, Error>({
    queryKey: ['apkgPreviewMeta', key],
    enabled: !!key,
    queryFn: () => getApkgPreviewMeta(key as string),
    staleTime: 5 * 60 * 1000,
  });
}

export function useApkgPreviewStream(
  key: string | undefined,
  deckId: number | null = null
) {
  return useInfiniteQuery<ApkgPreviewBatch, Error>({
    queryKey: ['apkgPreview', key, deckId],
    enabled: !!key,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      getApkgPreviewBatch(key as string, pageParam as number | null, {
        deckId,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}
