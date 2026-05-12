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
    title: 'How I use Notion to Anki as a medical student',
    embedId: 'UnTo_fN1jpc',
  },
  {
    title: 'Notion2Anki — Perfekter Workflow fürs Lernen',
    embedId: 'E51yLIIS3bk',
  },
  {
    title: 'How to use cloze deletions',
    embedId: 'r9pPNl8Mx_Q',
  },
  {
    title: 'Créer des flashcards Anki avec Notion',
    embedId: 'RHReYOKywZc',
  },
  {
    title: 'Turn any website into Anki flashcards',
    embedId: 'NLUfAWA2LJI',
  },
  {
    title: 'Use Notion to Anki for learning languages',
    embedId: 'lpC7C9wJoTA',
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
            <div key={item.embedId} className={styles.walkCard}>
              <div className={styles.walkVideo}>
                <iframe
                  src={`https://www.youtube.com/embed/${item.embedId}`}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className={styles.walkCardTitle}>{item.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
