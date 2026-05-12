import { useState } from 'react';
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
    title: 'Notion to Anki — Tutorial en Español',
    embedId: '57dW_buqtGM',
  },
  {
    title: 'Turn any website into Anki flashcards',
    embedId: 'NLUfAWA2LJI',
  },
  {
    title: 'Créer des flashcards Anki avec Notion',
    embedId: 'RHReYOKywZc',
  },
  {
    title: 'How to use cloze deletions',
    embedId: 'r9pPNl8Mx_Q',
  },
  {
    title: 'Best Notion hack for medical students',
    embedId: 'vINpYLMW9AE',
  },
  {
    title: 'Notion to Anki — complete guide',
    embedId: 'JrYdp18Hbs8',
  },
  {
    title: 'Use Notion to Anki for learning languages',
    embedId: 'lpC7C9wJoTA',
  },
  {
    title: 'Instantly turn your Notion notes into Anki flashcards',
    embedId: 'Ah-_wm2fgIk',
  },
  {
    title: 'Notion to Anki walkthrough',
    embedId: '9V0_N-Ex1U0',
  },
  {
    title: 'Turn your Notion notes into Anki flashcards',
    embedId: '6CyurZC4Bf0',
  },
  {
    title: 'Notion to Anki tutorial',
    embedId: 'A9aqXH2jVwQ',
  },
  {
    title: 'Notion to Anki — quick start',
    embedId: 'PDdEGonPCNk',
  },
];

function VideoCard({ embedId, title }: Readonly<{ embedId: string; title: string }>) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={styles.walkCard}>
        <div className={styles.walkVideo}>
          <iframe
            src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.walkCard}
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
    >
      <div className={styles.walkThumb}>
        <img
          src={`https://img.youtube.com/vi/${embedId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
        />
        <span className={styles.walkPlayBtn} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <p className={styles.walkCardTitle}>{title}</p>
    </button>
  );
}

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
            Drop a file and get an Anki deck back. Free and open source.
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
            <VideoCard
              key={item.embedId}
              embedId={item.embedId}
              title={item.title}
            />
          ))}
          <a href="/contact" className={styles.walkCard}>
            <div className={styles.walkCtaThumb}>
              <span className={styles.walkCtaIcon}>+</span>
              <p className={styles.walkCtaBody}>
                Made a video about 2anki? Contact us and we will feature it
                here for free.
              </p>
            </div>
            <p className={styles.walkCardTitle}>Submit your video</p>
          </a>
        </div>
      </section>
    </div>
  );
}
