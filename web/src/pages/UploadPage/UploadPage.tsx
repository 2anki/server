import { useState } from 'react';
import { Link } from 'react-router-dom';

import useQuery from '../../lib/hooks/useQuery';
import UploadForm from './components/UploadForm/UploadForm';
import SettingsIcon from '../../components/icons/SettingsIcon';
import SettingsModal from '../../components/modals/SettingsModal/SettingsModal';
import styles from '../../styles/shared.module.css';
import pageStyles from './UploadPage.module.css';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { getVisibleText } from '../../lib/text/getVisibleText';

const WALKTHROUGHS: ReadonlyArray<[string, string]> = [
  ['UnTo_fN1jpc', 'How I use Notion to Anki as a medical student'],
  ['JrYdp18Hbs8', 'Notion to Anki — complete guide'],
  ['r9pPNl8Mx_Q', 'How to use cloze deletions'],
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

  const forceCardOptionsOpen =
    view === 'template' || view === 'deck-options' || view === 'card-options';
  const [showCardOptionsModal, setShowCardOptionsModal] = useState(
    forceCardOptionsOpen
  );
  const [fileInteracted, setFileInteracted] = useState(forceCardOptionsOpen);

  return (
    <div className={styles.page}>
      <header className={`${styles.pageHeader} ${styles.flexBetween}`}>
        <div>
          <h1 className={styles.title}>
            {getVisibleText('upload.page.title')}
          </h1>
          <p className={styles.subtitle}>
            Turn your notes into flashcards in seconds
          </p>
        </div>
        {fileInteracted && (
          <Link
            className={styles.secondaryText}
            to="?view=template"
            onClick={() => setShowCardOptionsModal(true)}
            aria-label="Card and deck options"
            style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <SettingsIcon />
          </Link>
        )}
      </header>
      <UploadForm
        setErrorMessage={setErrorMessage}
        onFileSelected={() => setFileInteracted(true)}
      />
      <p className={pageStyles.footnote}>
        Your uploaded files are deleted after 2 hours.
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
      <SettingsModal
        setError={setErrorMessage}
        pageId={null}
        isActive={showCardOptionsModal}
        onClickClose={() => {
          globalThis.history.pushState({}, '', 'upload');
          setShowCardOptionsModal(false);
        }}
      />
    </div>
  );
}
