import React from 'react';

interface DownloadTitleProps {
  hasFiles: boolean;
}

export const DownloadTitle: React.FC<DownloadTitleProps> = ({ hasFiles }) => {
  return hasFiles ? '✅ Your Anki Decks Are Ready!' : '❌ No Anki Decks Available';
};
