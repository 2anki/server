import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CardOptionsForm } from '../../components/CardOptionsForm/CardOptionsForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import sharedStyles from '../../styles/shared.module.css';
import styles from './CardOptionsPage.module.css';

interface PerPageItem {
  pageId: string;
  title: string | null;
  updatedAt: string | null;
}

interface Props {
  setErrorMessage: ErrorHandlerType;
}

function formatUpdatedAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Updated a moment ago';
  if (diffMin < 60) return `Updated ${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Updated ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Updated ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return `Updated ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function CardOptionsPage({ setErrorMessage }: Readonly<Props>) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [perPageItems, setPerPageItems] = useState<PerPageItem[]>([]);

  const pageId = params.get('pageId');
  const pageTitle = params.get('title');
  const returnTo = params.get('returnTo') ?? '/upload';

  const goBack = () => navigate(returnTo);

  useEffect(() => {
    if (pageId != null) return;
    get2ankiApi()
      .listSettings()
      .then((data) => setPerPageItems(data.items))
      .catch(() => setPerPageItems([]));
  }, [pageId]);

  return (
    <div className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        {pageId != null && (
          <button type="button" onClick={goBack} className={styles.backLink}>
            ← Back
          </button>
        )}
        <h1 className={sharedStyles.title}>Card options</h1>
        {pageId != null && (
          <p className={sharedStyles.subtitle}>
            {`Custom options for ${pageTitle ?? 'this page'}. Saved changes apply only to this page.`}
          </p>
        )}
      </header>

      {pageId == null && (
        <section className={styles.pagesSection}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={sharedStyles.sectionHeading}>Pages with custom options</h2>
              <p className={sharedStyles.smallDescription}>Open one to edit or reset its options.</p>
            </div>
            {perPageItems.length > 0 && (
              <span className={styles.sectionCount}>
                {perPageItems.length} {perPageItems.length === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>

          {perPageItems.length === 0 ? (
            <div className={sharedStyles.emptyState}>
              <p>No pages with custom options yet.</p>
              <p className={sharedStyles.smallDescription}>
                When you change card options for a specific page, it shows up here. The defaults below stay untouched.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {perPageItems.map((item) => {
                const updatedLabel = formatUpdatedAt(item.updatedAt);
                return (
                  <li key={item.pageId}>
                    <Link
                      to={`/rules/${encodeURIComponent(item.pageId)}`}
                      className={styles.row}
                      aria-label={`Edit settings for ${item.title ?? item.pageId}`}
                    >
                      <div className={styles.rowText}>
                        <span className={styles.rowTitle} title={item.title ?? item.pageId}>
                          {item.title ?? 'Untitled page'}
                        </span>
                        {updatedLabel && (
                          <span className={styles.rowMeta}>{updatedLabel}</span>
                        )}
                      </div>
                      <a
                        href={`https://www.notion.so/${item.pageId.replace(/-/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.notionLink}
                        aria-label={`Open ${item.title ?? 'page'} in Notion`}
                        title="Open in Notion"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img src="/icons/Notion_app_logo.png" alt="" width={16} height={16} />
                      </a>
                      <span className={styles.rowChevron} aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {pageId == null && (
        <div className={styles.defaultsHeader}>
          <h2 className={sharedStyles.sectionHeading}>Default options</h2>
          <p className={sharedStyles.smallDescription}>
            These defaults apply to every conversion. You can override them for individual pages from your Notion library.
          </p>
        </div>
      )}

      <div className={sharedStyles.sectionCard}>
        <CardOptionsForm
          pageId={pageId}
          pageTitle={pageTitle}
          onSaved={pageId != null ? goBack : undefined}
          onReset={pageId != null ? goBack : undefined}
          setError={setErrorMessage}
          layout="grid"
        />
      </div>
    </div>
  );
}
