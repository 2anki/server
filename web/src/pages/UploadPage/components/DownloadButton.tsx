import { useEffect, useRef } from 'react';
import { getDownloadFileName } from '../../DownloadsPage/helpers/getDownloadFileName';
import formStyles from './UploadForm/UploadForm.module.css';
import sharedStyles from '../../../styles/shared.module.css';

interface Props {
  downloadLink: string | null | undefined;
  deckName: string | undefined;
  uploading: boolean;
  cardCount?: number | null;
}

function getButtonLabel(uploading: boolean, isEmptyDeck: boolean): string {
  if (uploading) return 'Converting...';
  if (isEmptyDeck) return 'Download empty deck';
  return 'Download';
}

function DownloadButton(props: Readonly<Props>) {
  const { downloadLink, deckName, uploading, cardCount } = props;
  const isDownloadable = downloadLink && deckName;
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const isReady = downloadLink && !uploading;
  const isEmptyDeck = cardCount === 0;

  useEffect(() => {
    if (isReady && !isEmptyDeck) {
      downloadRef.current?.click();
    }
  }, [isReady, isEmptyDeck, downloadRef]);

  if (!isDownloadable && !uploading) {
    return null;
  }

  return (
    <div className={formStyles.downloadWrapper}>
      {isReady && isEmptyDeck && (
        <div className={sharedStyles.alertDanger}>
          <p>
            No cards in this deck yet. 2anki turns Notion toggle blocks (the
            little triangles you click to expand) into flashcards — the toggle
            title becomes the question, what&apos;s inside becomes the answer.
            We didn&apos;t find any in this page. Open the page in Notion, wrap
            your key terms in toggles, then convert again.{' '}
            <a href="/documentation/help/common-problems#could-not-create-a-deck-using-your-file-and-rules">
              See examples
            </a>
            .
          </p>
        </div>
      )}
      <button
        type="button"
        className={`${formStyles.downloadButton} ${
          isReady ? formStyles.downloadButtonReady : ''
        }`}
        onClick={(event) => {
          if (!isDownloadable) {
            event?.preventDefault();
          }
          downloadRef.current?.click();
        }}
        disabled={!isDownloadable}
      >
        {getButtonLabel(uploading, isEmptyDeck)}
      </button>
      {downloadLink && (
        <a
          hidden
          target="_blank"
          aria-label="download link"
          href={downloadLink}
          download={getDownloadFileName(deckName ?? 'Untitled')}
          ref={downloadRef}
          rel="noreferrer"
        >
          {downloadLink}
        </a>
      )}
    </div>
  );
}

export default DownloadButton;
