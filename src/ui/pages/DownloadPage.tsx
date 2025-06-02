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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Download your Anki decks from 2anki.net" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          }
          * { box-sizing: border-box; }
          a:hover { text-decoration: underline; }
        ` }} />
      </head>
      <body>
        <div style={styles.downloadContainer}>
          <header>
            <h1 style={styles.downloadHeader}>
              <DownloadTitle hasFiles={hasFiles} />
            </h1>
            <DownloadMessage hasFiles={hasFiles} styles={{ pageDescription: styles.pageDescription, footerLink: styles.footerLink }} />
          </header>
          <main>
            <DownloadList apkgFiles={apkgFiles} id={id} styles={styles} />
          </main>
          {hasFiles && <DownloadFooter styles={{ footer: styles.footer, footerLink: styles.footerLink }} />}
        </div>
      </body>
    </html>
  );
};
