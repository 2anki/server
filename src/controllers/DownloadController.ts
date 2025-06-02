import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import StorageHandler from '../lib/storage/StorageHandler';
import DownloadService from '../services/DownloadService';
import { canAccess } from '../lib/misc/canAccess';
import { DownloadPage } from '../ui/pages/DownloadPage';

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
        throw new Error(`File not found: ${key}`);
      }
    } catch (error) {
      console.error(error);
      if (this.service.isMissingDownloadError(error)) {
        this.service.deleteMissingFile(owner, key);
        res.redirect('/uploads');
      } else {
        console.info('Download failed');
        console.error(error);
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

        const page = DownloadPage({
          id,
          files: files.filter((file) => file.endsWith('.apkg')),
        });
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

  async getBulkDownload(req: Request, res: Response) {
    const { id } = req.params;
    const workspaceBase = process.env.WORKSPACE_BASE!;
    const workspace = path.join(workspaceBase, id);

    if (!fs.existsSync(workspace) || !canAccess(workspace, workspaceBase)) {
      return res.status(404).end();
    }

    if (!fs.statSync(workspace).isDirectory()) {
      return res.status(400).send('Not a valid workspace');
    }

    try {
      const allFiles = await fs.promises.readdir(workspace);
      const ankiFiles = allFiles.filter((file) => file.endsWith('.apkg'));

      if (ankiFiles.length === 0) {
        return res.status(404).send('No Anki deck files found');
      }

      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.status(500).send('Error creating bulk download');
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="anki-decks-${id}.zip"`
      );

      archive.pipe(res);
      ankiFiles.forEach((file) => {
        const filePath = path.join(workspace, file);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file });
        }
      });

      archive.finalize();
    } catch (error) {
      res.status(500).send('Error creating bulk download');
    }
  }
}

export default DownloadController;
