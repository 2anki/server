import React from 'react';
import { styles } from './styles';

interface DownloadTitleProps {
  count: number;
}

export const DownloadTitle: React.FC<DownloadTitleProps> = ({ count }) => {
  const label = count === 1 ? '1 deck ready' : `${count} decks ready`;
  return <h1 style={styles.h1}>{label}</h1>;
};
