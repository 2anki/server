import { useNavigate, useSearchParams } from 'react-router-dom';
import { CardOptionsForm } from '../../components/CardOptionsForm/CardOptionsForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import sharedStyles from '../../styles/shared.module.css';
import styles from './CardOptionsPage.module.css';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export default function CardOptionsPage({ setErrorMessage }: Readonly<Props>) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const pageId = params.get('pageId');
  const pageTitle = params.get('title');
  const returnTo = params.get('returnTo') ?? '/upload';

  const goBack = () => navigate(returnTo);

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
    </div>
  );
}
