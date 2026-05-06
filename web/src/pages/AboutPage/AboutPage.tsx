import styles from '../../styles/shared.module.css';
import pageStyles from './AboutPage.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeaderCenter}>
        <h1 className={styles.title}>About 2anki.net</h1>
        <p className={styles.subtitle}>
          Making Anki flashcards easier, better, and faster
        </p>
      </header>

      <section className={`${styles.card} ${styles.marginBottomLg}`}>
        <h2 className={styles.subHeading}>What is 2anki?</h2>
        <p>
          2anki.net is an open source micro-SaaS that converts Notion notes
          into Anki flashcards. It is used by autodidacts, students and
          professionals around the world.
        </p>
        <p>Fast, simple, easy and open source.</p>
        <div className={styles.textCenter}>
          <a href="/upload" className={pageStyles.ctaButton}>
            Get started
          </a>
        </div>
        <p className={styles.marginTopMd}>
          The goal of 2anki.net is to provide a good way to make{' '}
          <a href="https://apps.ankiweb.net/" target="_blank" rel="noreferrer">
            Anki
          </a>{' '}
          flashcards easier, better and faster. The dream is to have powerful
          and easy ways to produce high quality flashcards. This project is a
          complement to Anki and Notion.
        </p>
      </section>

      <div className={`${styles.columns2} ${styles.marginBottomLg}`}>
        <section className={styles.card}>
          <h2 className={styles.subHeading}>What we are not</h2>
          <p>
            If you are looking for an Anki or Notion replacement then this
            project is probably not right for you. We are never going to
            compete against Anki — we are building bridges.
          </p>
          <p>
            That said, if you are not content with Anki, you might want to
            check out{' '}
            <a
              href="https://www.super-memory.com/"
              target="_blank"
              rel="noreferrer"
            >
              SuperMemo
            </a>
            .
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.subHeading}>Benefits</h2>
          <ul>
            <li>
              No technical skills required and free to use by anyone, anywhere
              🤗
            </li>
            <li>Convert your Notion toggle lists to Anki cards easily</li>
            <li>Support for embeds, audio files, images and more</li>
          </ul>
          <p className={styles.smallDescription}>
            Due to server costs there are quota limits in place, but you can
            work around this by self-hosting.
          </p>
        </section>
      </div>

      <section className={styles.card}>
        <h2 className={styles.subHeading}>How it works</h2>
        <p>
          Check out our{' '}
          <a href="/documentation/guides/getting-started">detailed guide</a>{' '}
          or follow these simple steps:
        </p>
        <ol>
          <li>Create toggle lists in Notion</li>
          <li>Export and upload to 2anki.net</li>
          <li>Download and import into Anki</li>
        </ol>
        <p className={styles.marginTopLg}>
          Toggle lists at the top level become Anki flashcards. The toggle
          line is the front of the card and everything inside the details is
          the back. That is the main feature, but you can customise the
          behaviour via card options.
        </p>
        <p>
          Considering how powerful{' '}
          <a
            href="https://docs.ankiweb.net/#/editing?id=cloze-deletion"
            target="_blank"
            rel="noreferrer"
          >
            cloze deletions
          </a>{' '}
          are, they are enabled by default.
        </p>
      </section>
    </div>
  );
}
