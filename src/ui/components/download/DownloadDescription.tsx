import React from 'react';

interface DownloadMessageProps {
  hasFiles: boolean;
  styles?: {
    pageDescription?: React.CSSProperties;
    footerLink?: React.CSSProperties;
  };
}

const DownloadMessage: React.FC<DownloadMessageProps> = ({
  hasFiles,
  styles = {},
}) => {
  const { pageDescription = {}, footerLink = {} } = styles;

  return (
    <p style={pageDescription}>
      {hasFiles ? (
        <>
          <span style={{ fontWeight: 500 }}>Success!</span> Here are the Anki
          decks created from your upload. Click on individual deck names to
          download them, or use the "Download All Files" button to get
          everything at once.
        </>
      ) : (
        <>
          No Anki decks were found in your upload. Please check that your
          content follows the{' '}
          <a 
            href="https://docs.2anki.net/" 
            style={footerLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="2anki.net formatting guidelines (opens in new tab)"
          >
            2anki.net formatting guidelines
          </a>{' '}
          for creating valid flashcards.
        </>
      )}
    </p>
  );
};

export default DownloadMessage;
