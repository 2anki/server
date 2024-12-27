import path from 'path';
import React from 'react';

interface DownloadListProps {
  apkgFiles: string[];
  id: string;
  styles: {
    downloadList: React.CSSProperties;
    downloadItem: React.CSSProperties;
    downloadItemName: React.CSSProperties;
    downloadItemLink: React.CSSProperties;
  };
}

const DownloadList: React.FC<DownloadListProps> = ({
  apkgFiles,
  id,
  styles,
}) => {
  return (
    <ul style={styles.downloadList}>
      {apkgFiles.map((file) => (
        <li key={file} style={styles.downloadItem}>
          <span style={styles.downloadItemName}>{file}</span>
          <a
            style={styles.downloadItemLink}
            download={`${path.basename(file)}`}
            href={`${id}/${file}`}
          >
            Download
          </a>
        </li>
      ))}
    </ul>
  );
};

export default DownloadList;
