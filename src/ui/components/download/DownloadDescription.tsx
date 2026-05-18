import React from 'react';
import { styles } from './styles';

interface DownloadDescriptionProps {
  sourceTitle: string | null;
  totalSizeBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DownloadDescription: React.FC<DownloadDescriptionProps> = ({
  sourceTitle,
  totalSizeBytes,
}) => {
  if (sourceTitle == null || sourceTitle.trim().length === 0) {
    return null;
  }

  return (
    <p style={styles.subhead}>
      From {sourceTitle} · {formatBytes(totalSizeBytes)} total
    </p>
  );
};

export default DownloadDescription;
