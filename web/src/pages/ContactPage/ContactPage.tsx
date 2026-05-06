import styles from '../../styles/shared.module.css';

export function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Contact &amp; support</h1>
        <p className={styles.subtitle}>
          We&apos;re here to help. If you have any questions, feedback, or need
          assistance, don&apos;t hesitate to reach out.
        </p>
      </header>

      <section>
        <h2 className={styles.subHeading}>Our team</h2>
        <p>
          Hello, we&apos;re the development team behind this project.
          We&apos;re always happy to hear from you and help out with any issues
          you might have.
        </p>
        <p>
          Email: <a href="mailto:support@2anki.net">support@2anki.net</a>
        </p>
      </section>

      <section className={styles.marginTopLg}>
        <h2 className={styles.subHeading}>How to reach us</h2>
        <p>
          To make things quicker and easier, please include the following in
          your email:
        </p>
        <ul>
          <li>Your name</li>
          <li>A brief description of your question or issue</li>
          <li>Steps to reproduce the issue (if it is a technical problem)</li>
          <li>Any screenshots or logs that might help</li>
        </ul>
        <p>We aim to get back to you within 24-48 hours.</p>
        <p>Thank you for being part of our community!</p>
      </section>
    </div>
  );
}
