import { Request, Response } from 'express';

import { sendError } from '../lib/error/sendError';
import DownloadService from '../services/DownloadService';

class DownloadController {
  constructor(private service: DownloadService) {}

  async getFile(req: Request, res: Response) {
    const { key } = req.params;

    if (!this.service.isValidKey(key)) {
      return res.status(400).send();
    }

    console.debug(`download ${key}`);
    const { owner } = res.locals;
    try {
      const body = await this.service.getFileBody(owner, key);
      if (body) {
        res.send(body);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      console.error(error);
      if (this.service.isMissingDownloadError(error)) {
        this.service.deleteMissingFile(owner, key);
        res.redirect('/uploads');
      } else {
        sendError(error);
        res.status(404).send();
      }
    }
  }
}

export default DownloadController;
