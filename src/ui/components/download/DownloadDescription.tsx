import React from 'react';

interface DownloadMessageProps {
  hasFiles: boolean;
}

const DownloadMessage: React.FC<DownloadMessageProps> = ({ hasFiles }) => {
  return (
    <p>
      {hasFiles ? (
        'This is the list of Anki decks detected from your upload.'
      ) : (
        <>
          No Anki decks found. Learn more about creating valid flashcards at{' '}
          <a href="https://docs.2anki.net/">2anki.net documentation</a>.
        </>
      )}
    </p>
  );
};

export default DownloadMessage;
