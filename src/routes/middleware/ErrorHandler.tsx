import express from 'express';
import { UploadedFile } from '../../lib/storage/types';
import { isLimitError } from '../../lib/misc/isLimitError';
import { isEmptyPayload } from '../../lib/misc/isEmptyPayload';
import { perserveFilesForDebugging } from '../../lib/debug/perserveFilesForDebugging';

export default function ErrorHandler(
  res: express.Response,
  req: express.Request,
  err: Error
) {
  const uploadedFiles = req.files as UploadedFile[];
  const skipError = isLimitError(err);

  if (!skipError) {
    console.info('Send error');
    console.error(err);
    if (!isEmptyPayload(uploadedFiles)) {
      perserveFilesForDebugging(req.files as UploadedFile[], err);
    }
  }

  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
