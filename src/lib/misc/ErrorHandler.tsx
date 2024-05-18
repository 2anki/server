import express from 'express';
import { renderToStaticMarkup } from 'react-dom/server';
import { sendError } from '../error/sendError';
import { UploadedFile } from '../storage/types';
import path from 'path';
import os from 'os';
import { getRandomUUID } from '../../shared/helpers/getRandomUUID';
import fs from 'fs';
import { isLimitError } from './isLimitError';
import { isEmptyPayload } from './isEmptyPayload';

export const NO_PACKAGE_ERROR = new Error(
  renderToStaticMarkup(
    <>
      <div className="info">
        Could not create a deck using your file(s) and rules. Make sure to at
        least create on valid toggle or verify your{' '}
        <a href="/upload?view=template">settings</a>? Example:
      </div>
      <div className="card" style={{ width: '50%', padding: '1rem' }}>
        <details>
          <summary>This the front</summary>
          This is the back
        </details>
      </div>
    </>
  )
);

function perserveFilesForDebugging(uploadedFiles: UploadedFile[], err: Error) {
  const debugDirectory = path.join(os.tmpdir(), 'debug', getRandomUUID());

  if (!fs.existsSync(debugDirectory)) {
    try {
      fs.mkdirSync(debugDirectory, { recursive: true });
      console.log(`Created debug directory: ${debugDirectory}`);
    } catch (error) {
      console.error(`Failed to create debug directory: ${error}`);
      return;
    }
  }

  const timestamp = new Date().toISOString();
  const errorMessage = `${timestamp} - ${err.name}: \n${err.message}\n${err.stack}`;
  fs.writeFileSync(`${debugDirectory}/error.txt`, errorMessage);
  uploadedFiles.forEach((file, index) => {
    try {
      const destPath = `${debugDirectory}/${index}-${path.basename(
        file.originalname
      )}`;
      const fileContents = fs.readFileSync(file.path);
      fs.writeFileSync(destPath, fileContents);
      console.log(`Copied file ${file.path} to ${destPath}`);
    } catch (error) {
      console.error(`Error copying file ${file.path}: ${error}`);
    }
  });
}

export default function ErrorHandler(
  res: express.Response,
  req: express.Request,
  err: Error
) {
  const uploadedFiles = req.files as UploadedFile[];
  const skipError = isLimitError(err) || isEmptyPayload(uploadedFiles);

  if (skipError) {
    sendError(err);
    if (!isEmptyPayload(uploadedFiles)) {
      perserveFilesForDebugging(req.files as UploadedFile[], err);
    }
  }

  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
