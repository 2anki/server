import fs from 'fs';

import { Request, Response } from 'express';

import path from 'path';
import StorageHandler from '../lib/storage/StorageHandler';
import DownloadService from '../services/DownloadService';
import { canAccess } from '../lib/misc/canAccess';
import { DownloadPage } from '../ui/pages/DownloadPage';
import { createZipArchive } from '../../lib/zip/archive';

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

  async downloadAllAsZip(req: Request, res: Response) {
    const { id } = req.params;
    const workspaceBase = process.env.WORKSPACE_BASE!;
    const workspacePath = path.join(workspaceBase, id);

    if (!fs.existsSync(workspacePath) || !fs.statSync(workspacePath).isDirectory()) {
      return res.status(404).send('Workspace not found or is not a directory.');
    }

    try {
      const files = fs.readdirSync(workspacePath);
      const apkgFiles = files
        .filter((file) => file.endsWith('.apkg'))
        .map((file) => ({
          filePath: path.join(workspacePath, file),
          name: file,
        }));

      if (apkgFiles.length === 0) {
        return res.status(404).send('No .apkg files found in the workspace.');
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.zip"`);

      const zipStream = createZipArchive(apkgFiles);
      zipStream.pipe(res);

      // Handle errors during streaming
      zipStream.on('error', (err) => {
        console.error('Error during ZIP streaming:', err);
        if (!res.headersSent) {
          // If headers are not sent, we can still send a proper error status
          res.status(500).send('Error creating ZIP file.');
        } else {
          // If headers are already sent, we can only try to end the response
          // This might result in a partially sent file, which is not ideal but better than hanging
          res.end();
        }
      });

    } catch (error) {
      console.error('Error preparing to download all as ZIP:', error);
      res.status(500).send('Error preparing files for ZIP.');
    }
  }
}

export default DownloadController;
