import React from 'react';

interface DownloadFooterProps {
  styles?: {
    footer?: React.CSSProperties;
    footerLink?: React.CSSProperties;
  };
}

export const DownloadFooter: React.FC<DownloadFooterProps> = ({
  styles = {},
}) => {
  const { footer = {}, footerLink = {} } = styles;

  return (
    <div style={footer}>
      <p>
        These files will be automatically deleted after 24 hours.
        <br />
        <a
          href="https://2anki.net"
          style={footerLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Return to 2anki.net (opens in new tab)"
        >
          Return to 2anki.net
        </a>{' '}
        |
        <a
          href="https://docs.2anki.net"
          style={footerLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Documentation (opens in new tab)"
        >
          Documentation
        </a>{' '}
        |
        <a
          href="https://github.com/2anki/2anki.net"
          style={footerLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository (opens in new tab)"
        >
          GitHub
        </a>
      </p>
      <p style={{ fontSize: '12px', marginTop: '10px' }}>
        &copy; {new Date().getFullYear()} 2anki.net - Convert your notes to Anki
        flashcards
      </p>
    </div>
  );
};
