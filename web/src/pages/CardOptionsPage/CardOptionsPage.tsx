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
  if (diffMin < 1) return 'a moment ago';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
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
    <div className={styles.pageShell}>
    <div className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        {pageId != null && (
          <button type="button" onClick={goBack} className={styles.backLink}>
            ← Back
          </button>
        )}
        <h1 className={sharedStyles.title}>Settings</h1>
        {pageId == null && (
          <p className={sharedStyles.subtitle}>
            Control how 2anki converts your content into Anki cards — deck names,
            templates, card types, and more. Changes here apply to every new
            conversion. To adjust settings for a single Notion page, open it from
            the list below.{' '}
            <Link to="/documentation">Read the docs</Link> for a full explanation
            of each option.
          </p>
        )}
        {pageId != null && (
          <p className={sharedStyles.subtitle}>
            {`Custom options for ${pageTitle ?? 'this page'}. Saved changes apply only to this page.`}
          </p>
        )}
      </header>

      {pageId == null && (
        <section className={`${styles.pagesSection} ${styles.pagesCard}`}>
          <h2 className={styles.pagesHeading}>
            Saved pages
            {perPageItems.length > 0 && (
              <span className={styles.sectionCount}>
                {perPageItems.length}
              </span>
            )}
          </h2>

          {perPageItems.length === 0 ? (
            <p className={styles.emptyInCard}>
              No saved pages yet. When you customise options for a specific Notion page, it appears here.
            </p>
          ) : (
            <ul className={styles.list}>
              {perPageItems.map((item) => {
                const updatedLabel = formatUpdatedAt(item.updatedAt);
                const displayTitle = item.title ?? null;
                const rulesHref = `/rules/${encodeURIComponent(item.pageId)}?returnTo=/card-options${item.title ? `&title=${encodeURIComponent(item.title)}` : ''}`;
                return (
                  <li key={item.pageId}>
                    <div className={styles.entry}>
                      <Link
                        to={rulesHref}
                        className={styles.entryMeta}
                        aria-label={`Edit settings for ${displayTitle ?? item.pageId}`}
                      >
                        <svg
                          className={styles.pageIcon}
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <rect x="2" y="1" width="9" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                          <path d="M5 5h5M5 8h5M5 11h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                          <path d="M11 1v4h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className={styles.entryText}>
                          <span className={styles.entryTitle}>
                            {displayTitle ?? 'Untitled page'}
                          </span>
                          {updatedLabel && (
                            <span className={styles.entryTimestamp}>Updated {updatedLabel}</span>
                          )}
                        </div>
                      </Link>
                      <a
                        href={`https://www.notion.so/${item.pageId.replace(/-/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionButton}
                        aria-label={`Open ${displayTitle ?? 'page'} in Notion`}
                        title="Open in Notion"
                      >
                        <img
                          src="/icons/Notion_app_logo.png"
                          alt=""
                          width={16}
                          height={16}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {pageId == null && (
        <div className={styles.formHeader}>
          <hr className={styles.divider} />
          <h2 className={styles.formHeading}>Default options</h2>
          <p className={sharedStyles.smallDescription}>
            Used for every file upload and any Notion page without saved overrides.
          </p>
        </div>
      )}

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
