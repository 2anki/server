// No path import needed anymore
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
  const showBulkDownload = apkgFiles.length > 0;
  const buttonHoverStyle = {
    backgroundColor: '#1d4ed8',
  };

  return (
    <>
      {showBulkDownload && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <button
            onClick={() => {
              window.location.href = `/download/${id}/bulk`;
            }}
            style={{
              ...styles.bulkDownloadButton,
              border: 'none',
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
            aria-label="Download all Anki decks"
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onFocus={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = styles.bulkDownloadButton
                .backgroundColor as string;
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = styles.bulkDownloadButton
                .backgroundColor as string;
            }}
          >
            <span style={{ marginRight: '8px' }}>📦</span> Download All Files
          </button>
        </div>
      )}
      <ul style={styles.downloadList}>
        {apkgFiles.map((file) => (
          <li key={file} style={styles.downloadItem}>
            <span style={styles.downloadItemName}>
              <span style={{ marginRight: '10px', fontSize: '18px' }}>📄</span>
              {file}
            </span>
            <button
              style={{
                ...styles.downloadItemLink,
                border: 'none',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: 'inherit',
              }}
              onClick={() => {
                window.location.href = `${id}/${file}`;
              }}
              aria-label={`Download ${file}`}
              onMouseOver={(e) => {
                Object.assign(e.currentTarget.style, buttonHoverStyle);
              }}
              onFocus={(e) => {
                Object.assign(e.currentTarget.style, buttonHoverStyle);
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.downloadItemLink
                  .backgroundColor as string;
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = styles.downloadItemLink
                  .backgroundColor as string;
              }}
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default DownloadList;
