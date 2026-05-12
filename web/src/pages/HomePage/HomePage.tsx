import { Navigate } from 'react-router-dom';
import UploadForm from '../UploadPage/components/UploadForm/UploadForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { useSettingsCardsOptions } from '../../components/modals/SettingsModal/useSettingsCardsOptions';
import styles from './HomePage.module.css';

interface HomePageProps {
  setErrorMessage: ErrorHandlerType;
  isLoggedIn: boolean;
}

const FORMATS = [
  'Notion',
  'PDF',
  'Markdown',
  'HTML',
  'CSV',
  'Word',
  'PowerPoint',
  'Excel',
];

const STEPS = [
  {
    title: 'Upload',
    body: 'Drop a Notion export, PDF, Markdown, HTML, CSV, Word, or Excel file.',
  },
  {
    title: 'Convert',
    body: '2anki builds your deck in seconds. Images, audio, code blocks, and cloze deletions all transfer.',
  },
  {
    title: 'Study',
    body: 'Open the .apkg file in Anki or AnkiDroid. Your cards are ready to review.',
  },
];

const WALKTHROUGHS = [
  {
    title: 'Convert with Notion integration',
    meta: 'Video walkthrough',
    href: 'https://www.youtube.com/watch?v=LqMiK2vGQ8Q',
  },
  {
    title: 'Convert with file upload',
    meta: 'Video walkthrough',
    href: 'https://www.youtube.com/watch?v=5ZDA79KfRi8',
  },
];

export function HomePage({
  setErrorMessage,
  isLoggedIn,
}: Readonly<HomePageProps>) {
  useSettingsCardsOptions(null);

  if (isLoggedIn) {
    return <Navigate to="/upload" replace />;
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Convert Notion to Anki</h1>
          <p className={styles.heroSubtitle}>
            Drop a file and get a beautiful Anki deck back. Free and open
            source.
          </p>
          <ul className={styles.heroPills}>
            {FORMATS.map((f) => (
              <li key={f} className={styles.heroPill}>{f}</li>
            ))}
          </ul>
          <span className={styles.socialProof}>
            <span className={styles.socialProofDot} aria-hidden="true" />
            Used by learners worldwide
          </span>
        </div>
        <div className={styles.uploadWrapper}>
          <UploadForm setErrorMessage={setErrorMessage} />
        </div>
      </section>

      <section className={styles.stepsSection}>
        <div className={styles.stepsInner}>
          <p className={styles.stepsHeading}>How it works</p>
          <div className={styles.stepsGrid}>
            {STEPS.map((step, idx) => (
              <div key={step.title} className={styles.step}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNumber}>{idx + 1}</span>
                  <p className={styles.stepTitle}>{step.title}</p>
                </div>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
          <p className={styles.stepsFooter}>
            Coming from Notion?{' '}
            <a href="/documentation/start-here/upload-a-file">
              Learn how to export your pages.
            </a>
          </p>
        </div>
      </section>

      <section className={styles.bottomSection}>
        <p className={styles.walkHeading}>Walkthroughs</p>
        <div className={styles.walkGrid}>
          {WALKTHROUGHS.map((item) => (
            <a
              key={item.href}
              className={styles.walkCard}
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.walkCardIcon}>&#9654;</span>
              <div className={styles.walkCardText}>
                <p className={styles.walkCardTitle}>{item.title}</p>
                <p className={styles.walkCardMeta}>{item.meta}</p>
              </div>
              <span className={styles.walkCardArrow}>&rarr;</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
