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

  getBulkDownload(req: Request, res: Response) {
    console.log('Bulk download requested for workspace:', req.params.id);
    const { id } = req.params;
    const workspaceBase = process.env.WORKSPACE_BASE!;
    const workspace = path.join(workspaceBase, id);
    console.log('Workspace path:', workspace);

    if (!fs.existsSync(workspace) || !canAccess(workspace, workspaceBase)) {
      console.log('Workspace not found or access denied');
      return res.status(404).end();
    }

    if (!fs.statSync(workspace).isDirectory()) {
      console.log('Not a valid workspace directory');
      return res.status(400).send('Not a valid workspace');
    }

    try {
      // Get all .apkg files in the workspace
      const allFiles = fs.readdirSync(workspace);
      console.log('All files in workspace:', allFiles);
      
      const files = allFiles.filter(file => file.endsWith('.apkg'));
      console.log('APKG files found:', files);
      
      if (files.length === 0) {
        console.log('No APKG files found in workspace');
        return res.status(404).send('No Anki deck files found');
      }

      // Set up the archive
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Set the headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="anki-decks-${id}.zip"`);

      // Pipe the archive to the response
      archive.pipe(res);

      // Add each .apkg file to the archive
      files.forEach(file => {
        const filePath = path.join(workspace, file);
        archive.file(filePath, { name: file });
      });

      // Finalize the archive and send the response
      archive.finalize();
    } catch (error) {
      console.error('Error creating bulk download:', error);
      res.status(500).send('Error creating bulk download');
    }
  }
}

export default DownloadController;
