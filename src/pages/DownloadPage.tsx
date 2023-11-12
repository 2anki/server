import path from 'path';

import ReactDOMServer from 'react-dom/server';

interface DownloadPageProps {
  id: string;
  files: string[];
}

export const DownloadPage = ({ id, files }: DownloadPageProps) => {
  return ReactDOMServer.renderToStaticMarkup(
    <html>
      <header>
        <title>Your download</title>
      </header>
      <body>
        <h1>Your download is ready</h1>
        {files.map((file) => (
          <li key={file}>
            <a download={`${path.basename(file)}`} href={`${id}/${file}`}>
              {file}
            </a>
          </li>
        ))}
      </body>
    </html>
  );
};
