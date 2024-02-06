import express from 'express';
import { renderToStaticMarkup } from 'react-dom/server';
import { sendError } from '../error/sendError';
import { UploadedFile } from '../storage/types';
import path from 'path';
import os from 'os';
import { getRandomUUID } from '../../shared/helpers/getRandomUUID';
import fs from 'fs';

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

function perserveFilesForDebugging(uploadedFiles: UploadedFile[]) {
  const debugDirectory = path.join(os.tmpdir(), 'debug', getRandomUUID());
  // Ensure valid input types
  if (!Array.isArray(uploadedFiles) || !uploadedFiles.length) {
    throw new Error(
      'Invalid input: uploadedFiles must be an array of File objects'
    );
  }

  if (!fs.existsSync(debugDirectory)) {
    try {
      fs.mkdirSync(debugDirectory, { recursive: true });
      console.log(`Created debug directory: ${debugDirectory}`);
    } catch (error) {
      console.error(`Failed to create debug directory: ${error}`);
      return;
    }
  }

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
  sendError(err);

  if (Array.isArray(req.files) && req.files.length > 0) {
    perserveFilesForDebugging(req.files as UploadedFile[]);
  }

  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
