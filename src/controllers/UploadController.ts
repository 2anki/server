import express from 'express';

import { getOwner } from '../lib/User/getOwner';
import { sendError } from '../lib/error/sendError';
import { getLimitMessage } from '../lib/misc/getLimitMessage';
import NotionService from '../services/NotionService';
import UploadService from '../services/UploadService';
import { getUploadHandler } from '../lib/misc/GetUploadHandler';

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
        if (error) {
          let msg = error.message;
          if (msg === 'File too large') {
            msg = getLimitMessage();
          } else {
            sendError(error);
          }
          return res.status(500).send(msg);
        }
        await this.service.handleUpload(req, res);
      });
    } catch (error) {
      sendError(error);
      res.status(400);
    }
  }
}

export default UploadController;
