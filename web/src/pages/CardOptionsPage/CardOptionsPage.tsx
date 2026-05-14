import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CardOptionsForm } from '../../components/CardOptionsForm/CardOptionsForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import sharedStyles from '../../styles/shared.module.css';
import styles from './CardOptionsPage.module.css';

interface PerPageItem {
  pageId: string;
  updatedAt: string | null;
}

interface Props {
  setErrorMessage: ErrorHandlerType;
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
        <button type="button" onClick={goBack} className={styles.backLink}>
          ← Back
        </button>
        <h1 className={sharedStyles.title}>Card options</h1>
        <p className={sharedStyles.subtitle}>
          {pageId
            ? `Customize how ${pageTitle ?? 'this page'} is converted into flashcards.`
            : 'Set the defaults used when converting uploads and Notion pages.'}
        </p>
      </header>

      <div className={styles.card}>
        <CardOptionsForm
          pageId={pageId}
          pageTitle={pageTitle}
          onSaved={goBack}
          onReset={goBack}
          setError={setErrorMessage}
          layout="grid"
        />
      </div>

      {pageId == null && (
        <section className={styles.perPageSection}>
          <h2 className={sharedStyles.sectionHeading}>Per-page overrides</h2>
          {perPageItems.length === 0 ? (
            <p className={sharedStyles.emptyState}>No per-page overrides saved.</p>
          ) : (
            <ul className={styles.perPageList}>
              {perPageItems.map((item) => (
                <li key={item.pageId}>
                  <Link to={`/card-options?pageId=${item.pageId}`}>{item.pageId}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
