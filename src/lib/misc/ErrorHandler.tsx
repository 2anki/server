import express from 'express';
import { sendError } from '../error/sendError';
import { UploadedFile } from '../storage/types';
import path from 'path';
import os from 'os';
import { getRandomUUID } from '../../shared/helpers/getRandomUUID';
import fs from 'fs';
import { isLimitError } from './isLimitError';
import { isEmptyPayload } from './isEmptyPayload';

export const NO_PACKAGE_ERROR = new Error(
  'Deck creation failed. Ensure a valid toggle or check settings. Note: Toggle headings are only supported in the Notion integration. Avoid using Markdown; use HTML instead.'
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
  const skipError = isLimitError(err);

  if (!skipError) {
    sendError(err);
    if (!isEmptyPayload(uploadedFiles)) {
      perserveFilesForDebugging(req.files as UploadedFile[], err);
    }
  }

  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
