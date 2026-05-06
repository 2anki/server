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

function DownloadButton(props: Props) {
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
            <strong>Your deck was created but contains no cards.</strong>{' '}
            Check that your Notion page uses toggle blocks, or adjust your
            conversion rules and try again.
          </p>
          <p className={sharedStyles.smallDescription}>
            You can still download the empty deck below if you want to inspect
            it.
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
