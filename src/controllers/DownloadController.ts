import fs from 'fs';

import { static as serve, NextFunction, Request, Response } from 'express';

import { sendError } from '../lib/error/sendError';
import DownloadService from '../services/DownloadService';
import StorageHandler from '../lib/storage/StorageHandler';
import path from 'path';
import { DownloadPage } from '../pages/DownloadPage';

class DownloadController {
  constructor(private service: DownloadService) {}

  async getFile(req: Request, res: Response, storage: StorageHandler) {
    const { key } = req.params;

    if (!this.service.isValidKey(key)) {
      return res.status(400).send();
    }

    console.debug(`download ${key}`);
    const { owner } = res.locals;
    try {
      const body = await this.service.getFileBody(owner, key, storage);
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

  getDownloadPage(req: Request, res: Response) {
    const { id } = req.params;
    const workspace = path.join(process.env.WORKSPACE_BASE!, id);

    if (!fs.existsSync(workspace)) {
      return res.status(404).end();
    }

    if (fs.statSync(workspace).isDirectory()) {
      fs.readdir(workspace, (err, files) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error reading directory');
          return;
        }

        const page = DownloadPage({ id, files });
        res.send(page);
      });
    } else {
      const fileContent = fs.readFileSync(workspace, 'utf8');
      return res.send(fileContent);
    }
  }

  getAPKGFile(req: Request, res: Response) {
    const { id, apkg } = req.params;
    const workspace = path.join(process.env.WORKSPACE_BASE!, id);
    const apkgFilePath = path.join(workspace, apkg);

    if (!fs.existsSync(apkgFilePath)) {
      return res.status(404).end();
    }

    const fileContent = fs.readFileSync(apkgFilePath, 'utf8');
    const contentLength = Buffer.byteLength(fileContent);
    res.set('Content-Type', 'application/apkg');
    res.set('Content-Length', contentLength.toString());
    return res.send(fileContent);
  }
}

export default DownloadController;
