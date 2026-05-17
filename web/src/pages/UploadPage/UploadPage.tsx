import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import useQuery from '../../lib/hooks/useQuery';
import { getVisibleText } from '../../lib/text/getVisibleText';
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

export function UploadPage({ setErrorMessage }: Readonly<Props>) {
  const query = useQuery();
  const view = query.get('view');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('from') === 'pass') {
      const next = new URLSearchParams(searchParams);
      next.delete('from');
      const qs = next.toString();
      navigate(qs ? `/upload?${qs}` : '/upload', { replace: true });
    }
  }, [searchParams, navigate]);

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
      <UploadForm setErrorMessage={setErrorMessage} />
      <p className={pageStyles.footnote}>
        Your uploaded files are deleted after 2 hours.
      </p>
      <p className={pageStyles.settingsHint}>
        Change deck names, templates, and conversion defaults in{' '}
        <Link to="/card-options">Settings</Link>.
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
