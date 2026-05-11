import styles from '../../styles/shared.module.css';
import PrintForm from './components/PrintForm';

export function PrintPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Print your flashcards</h1>
        <p className={styles.subtitle}>
          Drop an Anki deck (.apkg) here. We'll make a PDF you can print or
          share.
        </p>
      </header>
      <PrintForm />
      <p className={styles.smallDescription}>
        All files uploaded here are automatically deleted after 2 hours.
      </p>
    </div>
  );
}
