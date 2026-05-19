import styles from '../../styles/shared.module.css';
import { useUserLocals } from '../../lib/hooks/useUserLocals';
import { isPayingUser } from '../../components/NavigationBar/helpers/getPlanLabel';
import PrintForm from './components/PrintForm';

export function PrintPage() {
  const { data } = useUserLocals();
  const paying = isPayingUser(data?.locals);
  const freePrintAvailable = data?.freePrintAvailable;

  let statusLine: string | null = null;
  if (!paying) {
    if (freePrintAvailable === false) {
      statusLine = 'Your free PDF for this month has been used.';
    } else if (freePrintAvailable === true) {
      statusLine = '1 free PDF this month. Subscribe for unlimited.';
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Print your flashcards</h1>
        <p className={styles.subtitle}>
          Drop an Anki deck (.apkg) here. We'll make a PDF you can print or
          share.
        </p>
      </header>
      {statusLine != null && (
        <p className={styles.smallDescription}>{statusLine}</p>
      )}
      <PrintForm />
      <p className={styles.smallDescription}>
        All files uploaded here are automatically deleted after 2 hours.
      </p>
    </div>
  );
}
