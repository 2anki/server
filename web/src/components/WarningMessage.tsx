import styles from '../styles/shared.module.css';

function WarningMessage() {
  return (
    <section className={styles.alertWarning}>
      <p className={styles.alertWarningTitle}>This is a development server</p>
      <p>
        For the production version see{' '}
        <a href="https://2anki.net">https://2anki.net</a>
      </p>
      <p>When reporting bugs, please make sure to share examples</p>
    </section>
  );
}

export default WarningMessage;
