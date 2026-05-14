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

interface RelativeUnit {
  ms: number;
  label: string;
}

const RELATIVE_UNITS: RelativeUnit[] = [
  { ms: 60_000, label: 'minute' },
  { ms: 3_600_000, label: 'hour' },
  { ms: 86_400_000, label: 'day' },
  { ms: 2_592_000_000, label: 'month' },
  { ms: 31_536_000_000, label: 'year' },
];

function formatUpdatedAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  if (diffMs < RELATIVE_UNITS[0].ms) return 'a moment ago';
  let unit: RelativeUnit = RELATIVE_UNITS[0];
  for (const candidate of RELATIVE_UNITS) {
    if (diffMs >= candidate.ms) unit = candidate;
  }
  const count = Math.floor(diffMs / unit.ms);
  return `${count} ${unit.label}${count === 1 ? '' : 's'} ago`;
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
              Control how 2anki converts your content into Anki cards — deck
              names, templates, card types, and more. Changes here apply to
              every new conversion. To adjust settings for a single Notion page,
              open it from the list below.{' '}
              <Link to="/documentation">Read the docs</Link> for a full
              explanation of each option.
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
                No saved pages yet. When you customise options for a specific
                Notion page, it appears here.
              </p>
            ) : (
              <ul className={styles.list}>
                {perPageItems.map((item) => {
                  const updatedLabel = formatUpdatedAt(item.updatedAt);
                  const displayTitle = item.title ?? null;
                  const baseHref = `/rules/${encodeURIComponent(item.pageId)}?returnTo=/card-options`;
                  const rulesHref = item.title
                    ? `${baseHref}&title=${encodeURIComponent(item.title)}`
                    : baseHref;
                  return (
                    <li key={item.pageId}>
                      <div className={styles.entry}>
                        <Link
                          to={rulesHref}
                          className={styles.entryMeta}
                          aria-label={`Edit settings for ${displayTitle ?? item.pageId}`}
                        >
                          <div className={styles.entryText}>
                            <span className={styles.entryTitle}>
                              {displayTitle ?? 'Untitled page'}
                            </span>
                            {updatedLabel && (
                              <span className={styles.entryTimestamp}>
                                Updated {updatedLabel}
                              </span>
                            )}
                          </div>
                        </Link>
                        <a
                          href={`https://www.notion.so/${item.pageId.replaceAll('-', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionButton}
                          aria-label={`Open ${displayTitle ?? 'page'} in Notion`}
                          title="Open in Notion"
                        >
                          <img
                            src="/icons/Notion_app_logo.png"
                            alt=""
                            width={22}
                            height={22}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                'none';
                            }}
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
              Used for every file upload and any Notion page without saved
              overrides.
            </p>
          </div>
        )}

        <CardOptionsForm
          pageId={pageId}
          pageTitle={pageTitle}
          onSaved={pageId == null ? undefined : goBack}
          onReset={pageId == null ? undefined : goBack}
          setError={setErrorMessage}
        />
      </div>
    </div>
  );
}
