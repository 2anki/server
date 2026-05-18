import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import useQuery from '../../lib/hooks/useQuery';
import { getVisibleText } from '../../lib/text/getVisibleText';
import {
  dismissUploadPrimer,
  UPLOAD_PRIMER_DISMISSED_KEY,
} from '../../lib/data_layer/userPreferencesSync';
import styles from '../../styles/shared.module.css';
import UploadForm from './components/UploadForm/UploadForm';
import pageStyles from './UploadPage.module.css';

const WALKTHROUGHS: ReadonlyArray<[string, string]> = [
  ['UnTo_fN1jpc', 'How I use Notion to Anki as a medical student'],
  ['JrYdp18Hbs8', 'Notion to Anki — complete guide'],
  ['57dW_buqtGM', 'Cómo crear FLASHCARDS de ANKI usando NOTION'],
];

interface Props {
  setErrorMessage: ErrorHandlerType;
}

function VideoCard({
  embedId,
  title,
}: Readonly<{ embedId: string; title: string }>) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={pageStyles.walkCard}>
        <div className={pageStyles.walkVideo}>
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
      className={pageStyles.walkCard}
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
    >
      <div className={pageStyles.walkThumb}>
        <img
          src={`https://img.youtube.com/vi/${embedId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
        />
        <span className={pageStyles.walkPlayBtn} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <p className={pageStyles.walkCardTitle}>{title}</p>
    </button>
  );
}

function readPrimerDismissed(): boolean {
  try {
    return globalThis.localStorage?.getItem(UPLOAD_PRIMER_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function UploadPage({ setErrorMessage }: Readonly<Props>) {
  const query = useQuery();
  const view = query.get('view');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [primerDismissed, setPrimerDismissed] = useState<boolean>(readPrimerDismissed);

  useEffect(() => {
    if (searchParams.get('from') === 'pass') {
      const next = new URLSearchParams(searchParams);
      next.delete('from');
      const qs = next.toString();
      navigate(qs ? `/upload?${qs}` : '/upload', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleDismissPrimer = () => {
    setPrimerDismissed(true);
    void dismissUploadPrimer();
  };

  if (
    view === 'template' ||
    view === 'deck-options' ||
    view === 'card-options'
  ) {
    return <Navigate to="/card-options" replace />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>{getVisibleText('upload.page.title')}</h1>
        <p className={styles.subtitle}>
          Turn your notes into flashcards in seconds
        </p>
      </header>
      {!primerDismissed && (
        <section className={pageStyles.primer} aria-label="How 2anki works">
          <button
            type="button"
            className={pageStyles.primerDismiss}
            onClick={handleDismissPrimer}
            aria-label="Dismiss tips"
          >
            ✕
          </button>
          <p className={pageStyles.primerHeading}>Make cards from your Notion toggles</p>
          <p className={pageStyles.primerBody}>
            Each toggle becomes one card — the toggle title is the front, what's
            inside is the back. Export your page from Notion as HTML and drop the
            .zip below.
          </p>
          <a
            href="/documentation/start-here/upload-a-file"
            className={pageStyles.primerLink}
          >
            See a 30-second example
          </a>
        </section>
      )}
      <UploadForm setErrorMessage={setErrorMessage} />
      <p className={pageStyles.footnote}>
        Your uploaded files are deleted after 2 hours.
      </p>
      <p className={pageStyles.settingsHint}>
        Change deck names, templates, and conversion defaults in{' '}
        <Link to="/card-options?returnTo=/upload">Settings</Link>.
      </p>
      <div className={pageStyles.steps}>
        <div className={pageStyles.step}>
          <span className={pageStyles.stepNumber}>1</span>
          <div>
            <p className={pageStyles.stepTitle}>Drop or choose a file</p>
            <p className={pageStyles.stepBody}>
              Notion export, PDF, HTML, Markdown, Word, Excel, PowerPoint, or
              CSV.{' '}
              <a href="/documentation/start-here/upload-a-file">
                How to export from Notion
              </a>
            </p>
          </div>
        </div>
        <div className={pageStyles.step}>
          <span className={pageStyles.stepNumber}>2</span>
          <div>
            <p className={pageStyles.stepTitle}>We build your deck</p>
            <p className={pageStyles.stepBody}>
              Images, code blocks, cloze deletions, and formatting all transfer.
              Usually takes a few seconds.
            </p>
          </div>
        </div>
        <div className={pageStyles.step}>
          <span className={pageStyles.stepNumber}>3</span>
          <div>
            <p className={pageStyles.stepTitle}>Open in Anki</p>
            <p className={pageStyles.stepBody}>
              Your .apkg downloads automatically. Import it into Anki or
              AnkiDroid and start studying.
            </p>
          </div>
        </div>
      </div>
      <section className={pageStyles.walkthroughSection}>
        <p className={pageStyles.walkthroughHeading}>Walkthroughs</p>
        <div className={pageStyles.walkthroughGrid}>
          {WALKTHROUGHS.map(([embedId, title]) => (
            <VideoCard key={embedId} embedId={embedId} title={title} />
          ))}
        </div>
      </section>
    </div>
  );
}
