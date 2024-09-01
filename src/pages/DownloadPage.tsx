import path from 'path';

import ReactDOMServer from 'react-dom/server';

interface DownloadPageProps {
  id: string;
  files: string[];
}

export const DownloadPage = ({ id, files }: DownloadPageProps) => {
  const styles = {
    downloadContainer: {
      margin: '0 auto',
      maxWidth: '800px',
      padding: '20px',
      border: '1px solid #ccc',
    },
    downloadHeader: {
      fontSize: '24px',
      marginBottom: '20px',
    },
    downloadList: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
    },
    downloadItem: {
      marginBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    downloadItemName: {
      display: 'block',
      padding: '10px 20px',
      backgroundColor: '#eee',
      textDecoration: 'none',
      color: '#000',
      maxWidth: '80%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    downloadItemLinkHover: {
      backgroundColor: '#ddd',
    },
    downloadItemLink: {},
  };
  const apkgFiles = files.filter((file) => file.endsWith('.apkg'));
  return ReactDOMServer.renderToStaticMarkup(
    <html>
      <head>
        <title>Your download</title>
      </head>
      <body style={styles.downloadContainer}>
        <header style={{ padding: '1rem' }}>
          <h1 style={styles.downloadHeader}>Your downloads are ready</h1>
          This is the list of Anki decks detected from your upload.
        </header>
        <main>
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
          <p>
            This folder will be automatically deleted. Return to{' '}
            <a href="https://2anki.net">2anki.net</a>
          </p>
        </main>
      </body>
    </html>
  );
};
