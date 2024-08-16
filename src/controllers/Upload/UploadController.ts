import express from 'express';

import { getOwner } from '../../lib/User/getOwner';
import { sendError } from '../../lib/error/sendError';
import NotionService from '../../services/NotionService';
import UploadService from '../../services/UploadService';
import { getUploadHandler } from '../../lib/misc/GetUploadHandler';
import { isLimitError } from '../../lib/misc/isLimitError';
import { handleUploadLimitError } from './helpers/handleUploadLimitError';
import { getUploadLimits } from '../../lib/misc/getUploadLimits';
import { isPaying } from '../../lib/isPaying';
import {
  DropboxFile,
  DropboxRepository,
} from '../../data_layer/DropboxRepository';
import { getDatabase } from '../../data_layer';
import axios from 'axios';
import { handleDropbox } from './helpers/handleDropbox';
import { handleGoogleDrive } from './helpers/handleGoogleDrive';

class UploadController {
  constructor(
    private readonly service: UploadService,
    private readonly notionService: NotionService
  ) {}

  async deleteUpload(req: express.Request, res: express.Response) {
    const owner = getOwner(res);
    const { key } = req.params;

    if (!key) {
      return res.status(400).send();
    }

    try {
      await this.service.deleteUpload(owner, key);
      await this.notionService.purgeBlockCache(owner);
    } catch (error) {
      sendError(error);
      return res.status(500).send();
    }

    return res.status(200).send();
  }

  async getUploads(_req: express.Request, res: express.Response) {
    const owner = getOwner(res);
    try {
      const uploads = await this.service.getUploadsByOwner(owner);
      res.json(uploads);
    } catch (error) {
      sendError(error);
      res.status(400);
    }
  }

  file(req: express.Request, res: express.Response) {
    try {
      console.info('uploading file');
      const handleUploadEndpoint = getUploadHandler(res);

      handleUploadEndpoint(req, res, async (error) => {
        if (isLimitError(error)) {
          return handleUploadLimitError(req, res);
        }
        await this.service.handleUpload(req, res);
      });
    } catch (error) {
      sendError(error);
      res.status(400);
    }
  }

  async dropbox(req: express.Request, res: express.Response): Promise<void> {
    await handleDropbox(req, res, this.service.handleUpload).then(() => {
      console.debug('dropbox upload success');
    });
  }

  async googleDrive(req: express.Request, res: express.Response) {
    await handleGoogleDrive(req, res, this.service.handleUpload).then(() => {
      console.debug('google drive upload success');
    });
  }
}

export default UploadController;
