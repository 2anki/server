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
  // Always show bulk download if there are any files
  const showBulkDownload = apkgFiles.length > 0;
  
  return (
    <>
      {showBulkDownload && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <a
            href={`/download/${id}/bulk`}
            style={{
              ...styles.downloadItemLink,
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Download All Files
          </a>
        </div>
      )}
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
    </>
  );
};

export default DownloadList;
