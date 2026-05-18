import React from 'react';
import { DownloadFileViewModel } from '../../../controllers/DownloadController';
import { styles } from './styles';

interface DownloadListProps {
  files: DownloadFileViewModel[];
  id: string;
}

function formatKB(bytes: number): string {
  return `${Math.round(bytes / 1024)}`;
}

const DownloadList: React.FC<DownloadListProps> = ({ files, id }) => {
  return (
    <ul style={styles.list}>
      {files.map((file) => (
        <li key={file.originalName} style={styles.listItem}>
          <a
            href={`/download/${id}/${file.originalName}`}
            title={file.originalName}
            download={file.originalName}
            style={styles.itemLink}
          >
            <span style={styles.itemName}>{file.displayName}</span>
            <span style={styles.itemSize}>· {formatKB(file.sizeBytes)} KB</span>
          </a>
          <a
            href={`/download/${id}/${file.originalName}`}
            download={file.originalName}
            style={styles.itemDownload}
          >
            Download
          </a>
        </li>
      ))}
    </ul>
  );
};

export default DownloadList;
