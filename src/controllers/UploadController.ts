import express from 'express';

import { getOwner } from '../lib/User/getOwner';
import { sendError } from '../lib/error/sendError';
import { getLimitMessage } from '../lib/misc/getLimitMessage';
import StorageHandler from '../lib/storage/StorageHandler';
import NotionService from '../services/NotionService';
import UploadService from '../services/UploadService';

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
      const storage = new StorageHandler();
      const handleUploadEndpoint = this.service.getUploadHandler(res);

      handleUploadEndpoint(req, res, async (error) => {
        if (error) {
          let msg = error.message;
          if (msg === 'File too large') {
            msg = getLimitMessage();
          } else {
            sendError(error);
          }
          return res.status(500).send(msg);
        }
        await this.service.handleUpload(storage, req, res);
      });
    } catch (error) {
      sendError(error);
      res.status(400);
    }
  }
}

export default UploadController;
