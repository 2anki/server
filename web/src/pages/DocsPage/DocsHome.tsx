import { Link } from 'react-router-dom';
import styles from './DocsPage.module.css';

export function DocsHome() {
  return (
    <article className={styles.article}>
      <section className={styles.hero}>
        <img
          src="/docs-assets/mascot.png"
          alt="2anki.net mascot"
          className={styles.heroImage}
        />
        <h1 className={styles.heroTitle}>The 2anki.net documentation</h1>
        <p className={styles.heroTagline}>Create Anki flashcards fast</p>
        <div className={styles.heroActions}>
          <Link
            to="/documentation/guides/getting-started"
            className={styles.heroButtonPrimary}
          >
            Getting started →
          </Link>
          <a
            href="https://docs.ankiweb.net/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroButtonSecondary}
          >
            Read the Anki manual docs ↗
          </a>
        </div>
      </section>
    </article>
  );
}
