import ReactDOMServer from 'react-dom/server';
import { DownloadTitle } from '../components/download/DownloadTitle';
import DownloadMessage from '../components/download/DownloadDescription';
import DownloadList from '../components/download/DownloadList';
import { DownloadFooter } from '../components/download/DownloadFooter';
import { styles } from '../components/download/styles';

interface DownloadPageProps {
  id: string;
  files: string[];
}

export const DownloadPage = ({ id, files }: DownloadPageProps) => {
  const apkgFiles = files.filter((file) => file.endsWith('.apkg'));
  const hasFiles = apkgFiles.length > 0;

  return ReactDOMServer.renderToStaticMarkup(
    <html>
      <head>
        <title>
          <DownloadTitle hasFiles={hasFiles} />
        </title>
      </head>
      <body style={styles.downloadContainer}>
        <header style={{ padding: '1rem' }}>
          <h1 style={styles.downloadHeader}>
            <DownloadTitle hasFiles={hasFiles} />
          </h1>
          <DownloadMessage hasFiles={hasFiles} />
          {hasFiles && (
            <div style={{ marginTop: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
              <a
                href={`/download/${id}/zip`}
                download={`${id}.zip`}
                style={styles.downloadAllButton}
              >
                Download All as ZIP
              </a>
            </div>
          )}
        </header>
        <main>
          <DownloadList apkgFiles={apkgFiles} id={id} styles={styles} />
        </main>
        {hasFiles && <DownloadFooter />}
      </body>
    </html>
  );
};
