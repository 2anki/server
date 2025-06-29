import path from 'path';
import fs from 'fs';
import os from 'os';

import express from 'express';

import { getRandomUUID } from '../../shared/helpers/getRandomUUID';
import { UploadedFile } from '../storage/types';

export function preserveFilesForDebugging(
  request: express.Request,
  uploadedFiles: UploadedFile[],
  err: Error
) {
  console.info('Preserving files for debugging...');
  const debugDirectory = path.join(os.tmpdir(), 'debug', getRandomUUID());
  console.info('Debug directory:', debugDirectory);

  try {
    if (!fs.existsSync(debugDirectory)) {
      fs.mkdirSync(debugDirectory, { recursive: true });
      console.log(`Created debug directory: ${debugDirectory}`);
    }

    fs.writeFileSync(
      `${debugDirectory}/request.json`,
      JSON.stringify(request.body, null, 2)
    );

    const timestamp = new Date().toISOString();
    const errorMessage = `${timestamp} - ${err.name}: \n${err.message}\n${err.stack}`;
    console.info(errorMessage);
    fs.writeFileSync(`${debugDirectory}/error.txt`, errorMessage);

    uploadedFiles.forEach((file, index) => {
      const destPath = path.join(
        debugDirectory,
        `${index}-${path.basename(file.originalname)}`
      );
      const fileContents = fs.readFileSync(file.path);
      fs.writeFileSync(destPath, fileContents);
      console.log(`Copied file ${file.path} to ${destPath}`);
    });
  } catch (error) {
    console.error(`Error in perserveFilesForDebugging: ${error}`);
  }
}
