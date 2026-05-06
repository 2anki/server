import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import { ErrorPresenter } from '../../components/errors/ErrorPresenter';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import sharedStyles from '../../styles/shared.module.css';
import styles from './PreviewPage.module.css';
import { usePreviewStream } from './usePreviewStream';
import { BlockNode } from './BlockNode';

interface PreviewPageProps {
  setError: ErrorHandlerType;
}

export default function PreviewPage({ setError }: Readonly<PreviewPageProps>) {
  const { id } = useParams<{ id: string }>();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = usePreviewStream(id);

  useEffect(() => {
    if (error) setError(error);
  }, [error, setError]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const firstPage = data?.pages?.[0];
  const pageTitle = firstPage?.pageTitle ?? 'Loading…';
  const pageUrl = firstPage?.pageUrl;
  const returnTo = encodeURIComponent(`/preview/${id}`);
  const rulesHref = `/rules/${id}?returnTo=${returnTo}`;

  const blocks = useMemo(
    () => data?.pages.flatMap((page) => page.blocks) ?? [],
    [data]
  );

  if (!id) {
    return (
      <div className={sharedStyles.page}>
        <p className={styles.empty}>Missing page id.</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={sharedStyles.page}>
        <header className={sharedStyles.pageHeader}>
          <h1 className={sharedStyles.title}>Preview</h1>
        </header>
        <ErrorPresenter error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        <Link to="/notion" className={styles.backLink}>
          ← Back to Notion search
        </Link>
        <h1 className={sharedStyles.title} data-hj-suppress>
          {pageTitle}
        </h1>
        {pageUrl && (
          <p className={styles.pageLink}>
            <a href={pageUrl} target="_blank" rel="noreferrer">
              Open in Notion ↗
            </a>
          </p>
        )}
        <div className={styles.actionsRow}>
          <Link to={rulesHref} className={sharedStyles.btnSecondary}>
            Conversion rules
          </Link>
        </div>
      </header>

      {isLoading && !data ? (
        <SkeletonList count={4} />
      ) : (
        <article className={styles.preview}>
          {blocks.length === 0 && (
            <p className={styles.empty}>This page has no blocks to preview.</p>
          )}
          {blocks.map((block) => (
            <BlockNode key={block.id} block={block} />
          ))}
        </article>
      )}

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {isFetchingNextPage && (
        <div className={styles.loadingRow}>Loading more…</div>
      )}
    </div>
  );
}
