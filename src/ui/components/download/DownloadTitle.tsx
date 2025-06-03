import React from 'react';

interface DownloadTitleProps {
  hasFiles: boolean;
}

export const DownloadTitle: React.FC<DownloadTitleProps> = ({ hasFiles }) => {
  return hasFiles ? (
    <>
      <span aria-hidden="true">✅</span> Your Anki Decks Are Ready!
    </>
  ) : (
    <>
      <span aria-hidden="true">❌</span> No Anki Decks Available
    </>
  );
};
