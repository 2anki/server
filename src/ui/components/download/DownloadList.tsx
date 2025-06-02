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
    bulkDownloadButton: React.CSSProperties;
  };
}

const DownloadList: React.FC<DownloadListProps> = ({
  apkgFiles,
  id,
  styles,
}) => {
  // Always show bulk download if there are any files
  const showBulkDownload = apkgFiles.length > 0;

  // Create hover styles for download items
  const itemHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  // Create hover styles for buttons
  const buttonHoverStyle = {
    backgroundColor: '#1d4ed8',
  };

  return (
    <>
      {showBulkDownload && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <a
            href={`/download/${id}/bulk`}
            style={styles.bulkDownloadButton}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = styles.bulkDownloadButton.backgroundColor as string;
            }}
          >
            <span style={{ marginRight: '8px' }}>📦</span> Download All Files
          </a>
        </div>
      )}
      <ul style={styles.downloadList}>
        {apkgFiles.map((file) => (
          <li 
            key={file} 
            style={styles.downloadItem}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, itemHoverStyle);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <span style={styles.downloadItemName}>
              <span style={{ marginRight: '10px', fontSize: '18px' }}>📄</span>
              {file}
            </span>
            <a
              style={styles.downloadItemLink}
              download={`${path.basename(file)}`}
              href={`${id}/${file}`}
              onMouseOver={(e) => {
                Object.assign(e.currentTarget.style, buttonHoverStyle);
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.downloadItemLink.backgroundColor as string;
              }}
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
