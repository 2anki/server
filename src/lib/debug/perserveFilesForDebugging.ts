import path from 'path';
import fs from 'fs';
import os from 'os';

import { getRandomUUID } from '../../shared/helpers/getRandomUUID';
import { UploadedFile } from '../storage/types';

export function perserveFilesForDebugging(
  uploadedFiles: UploadedFile[],
  err: Error
) {
  const debugDirectory = path.join(os.tmpdir(), 'debug', getRandomUUID());

  try {
    if (!fs.existsSync(debugDirectory)) {
      fs.mkdirSync(debugDirectory, { recursive: true });
      console.log(`Created debug directory: ${debugDirectory}`);
    }

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
