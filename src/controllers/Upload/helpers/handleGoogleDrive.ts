import axios from 'axios';
import express from 'express';

import { isPaying } from '../../../lib/isPaying';
import { getUploadLimits } from '../../../lib/misc/getUploadLimits';
import { handleUploadLimitError } from './handleUploadLimitError';
import { getDatabase } from '../../../data_layer';
import { getOwner } from '../../../lib/User/getOwner';
import {
  GoogleDriveFile,
  GoogleDriveRepository,
} from '../../../data_layer/GoogleDriveRepository';
import { isEmptyUpload } from './isEmptyUpload';
import { getFilesOrEmpty } from './getFilesOrEmpty';
import { createGoogleDriveDownloadLink } from './createGoogleDriveDownloadLink';

export async function handleGoogleDrive(
  req: express.Request,
  res: express.Response,
  handleUpload: (req: express.Request, res: express.Response) => void
) {
  try {
    console.log('handling Google Drive files', req.body);
    const files = getFilesOrEmpty<GoogleDriveFile>(req.body);
    if (isEmptyUpload(files)) {
      console.debug('No Google Drive files selected.');
      res.status(400).send('No Google Drive files selected, one is required.');
      return;
    }

    const googleDriveAuth = req.body.googleDriveAuth;
    if (
      googleDriveAuth === undefined ||
      googleDriveAuth === null ||
      googleDriveAuth === 'undefined' ||
      googleDriveAuth === 'null'
    ) {
      res.status(400).send('Google Drive authentication is missing.');
      return;
    }

    const paying = isPaying(res.locals);
    const limits = getUploadLimits(paying);
    const totalSize = files.reduce((acc, file) => acc + file.sizeBytes, 0);
    if (!paying && totalSize > limits.fileSize) {
      handleUploadLimitError(req, res);
      return;
    }
    const repo = new GoogleDriveRepository(getDatabase());
    const owner = getOwner(res);
    if (owner) {
      await repo.saveFiles(files, owner);
    } else {
      console.log('Not storing anon users Google Drive files');
    }

    // @ts-ignore
    req.files = await Promise.all(
      files.map(async (file) => {
        const contents = await axios.get(createGoogleDriveDownloadLink(file), {
          headers: {
            Authorization: `Bearer ${googleDriveAuth}`,
          },
          responseType: 'blob',
        });
        return {
          originalname: file.name,
          size: file.sizeBytes,
          buffer: contents.data,
        };
      })
    );
    handleUpload(req, res);
  } catch (error) {
    console.debug('Error handling Google files', error);
    res.status(400).send('Error handling Google Drive files');
  }
}
