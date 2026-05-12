import styles from '../../styles/shared.module.css';

export function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Contact and support</h1>
        <p className={styles.subtitle}>
          Questions, feedback, or need help? We typically reply within
          24 to 48 hours.
        </p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.subHeading}>Email us</h2>
        <p>
          Reach us at{' '}
          <a href="mailto:support@2anki.net">support@2anki.net</a>. To help
          us resolve things faster, include:
        </p>
        <ul>
          <li>A brief description of your question or issue</li>
          <li>Steps to reproduce the problem (if technical)</li>
          <li>Any screenshots or error messages you see</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.subHeading}>Share your workflow</h2>
        <p>
          Made a video or tutorial about how you use 2anki? Send it to{' '}
          <a href="mailto:support@2anki.net">support@2anki.net</a> and we
          will feature it on the homepage for free. We already showcase
          walkthroughs in English, German, French, and Spanish — any
          language is welcome.
        </p>
      </section>
    </div>
  );
}
