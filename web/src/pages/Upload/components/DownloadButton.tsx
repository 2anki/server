import { useEffect, useRef } from 'react';

interface Props {
  downloadLink: string | undefined;
  deckName: string | undefined;
  uploading: boolean;
}

function DownloadButton(props: Props) {
  const {
    downloadLink, deckName, uploading,
  } = props;
  const isDownloadable = downloadLink && deckName;
  const downloadRef = useRef(null);

  const className = `button cta
              ${isDownloadable ? 'is-primary' : 'is-light'} 
              ${uploading ? 'is-loading' : ''}`;

  const isReady = downloadLink && !uploading;

  useEffect(() => {
    if (isReady) {
      downloadRef.current.click();
    }
  }, [isReady, downloadRef]);

  return (
    <div>
      <button
        type="button"
        className={className}
        onClick={(event) => {
          if (!isDownloadable) {
            event?.preventDefault();
          }
          downloadRef.current.click();
        }}
        disabled={!isDownloadable}
      >
        Download
      </button>
      <a hidden target="_blank" aria-label="download link" href={downloadLink} download={deckName} ref={downloadRef} rel="noreferrer">
        {downloadLink}
      </a>
    </div>
  );
}

export default DownloadButton;
