import fs from 'fs';
import path from 'path';

import { Request, Response } from 'express';

import { sendError } from '../lib/error/sendError';
import StorageHandler from '../lib/storage/StorageHandler';
import DownloadService from '../services/DownloadService';
import { canAccess } from '../lib/misc/canAccess';

class DownloadController {
  constructor(private service: DownloadService) {}

  loadTemplate(): string {
    return fs.readFileSync(
      path.join(__dirname, '../pages/download.html'),
      'utf8'
    );
  }

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
        throw new Error(`File not found: ${key}`);
      }
    } catch (error) {
      console.error(error);
      if (this.service.isMissingDownloadError(error)) {
        this.service.deleteMissingFile(owner, key);
        res.redirect('/uploads');
      } else {
        sendError(error);
        res
          .status(404)
          .send(
            "Download link expire, try converting again <a href='/upload'>upload</a>"
          );
      }
    }
  }

  getDownloadPage(req: Request, res: Response) {
    const { id } = req.params;
    const workspaceBase = process.env.WORKSPACE_BASE!;
    const workspace = path.join(workspaceBase, id);

    if (!fs.existsSync(workspace) || !canAccess(workspace, workspaceBase)) {
      return res.status(404).end();
    }

    if (fs.statSync(workspace).isDirectory()) {
      fs.readdir(workspace, (err, files) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error reading directory');
          return;
        }

        const listOfFiles = files
          .filter((file) => file.toLowerCase().endsWith('.apkg'))
          .map(
            (file) => `
            <li><span>${file}</span>
          <a download='${path.basename(file)}' href='${id}/${file}' >
           Download
        </a>
        </li>
            `
          )
          .join('\n');

        const page = this.loadTemplate().replace(
          '{DOWNLOAD_LIST}',
          listOfFiles
        );
        res.send(page);
      });
    } else {
      const fileContent = fs.readFileSync(workspace, 'utf8');
      return res.send(fileContent);
    }
  }

  getLocalFile(req: Request, res: Response) {
    const { id, filename } = req.params;
    const workspaceBase = process.env.WORKSPACE_BASE!;
    const workspace = path.join(workspaceBase, id);
    const filePath = path.join(workspace, filename);

    if (!canAccess(filePath, workspace) || !fs.existsSync(filePath)) {
      return res.status(404).end();
    }
    return res.sendFile(filePath);
  }
}

export default DownloadController;
