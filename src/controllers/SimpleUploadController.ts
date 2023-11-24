import fs from 'fs';
import path from 'path';

import express from 'express';

import { sendError } from '../lib/error/sendError';
import { getLimitMessage } from '../lib/misc/getLimitMessage';
import Settings from '../lib/parser/Settings';
import Workspace from '../lib/parser/WorkSpace';
import { UploadedFile } from '../lib/storage/types';
import GeneratePackagesUseCase from '../usecases/uploads/GeneratePackagesUseCase';

import { getUploadHandler } from '../lib/misc/GetUploadHandler';

class SimpleUploadController {
  async handleUpload(req: express.Request, res: express.Response) {
    try {
      const settings = new Settings(req.body || {});

      const useCase = new GeneratePackagesUseCase();
      const { packages } = await useCase.execute(
        res.locals.patreon,
        req.files as UploadedFile[],
        settings
      );

      if (packages.length === 0) {
        return res.status(400).json({
          error: 'no decks created',
        });
      }

      const response: { name: string; link: string }[] = [];
      const workspace = new Workspace(true, 'fs');
      const basePath = `/download/${workspace.id}`;
      for (const pkg of packages) {
        const p = path.join(workspace.location, pkg.name);
        fs.writeFileSync(p, pkg.apkg);
        response.push({
          name: pkg.name,
          link: `${basePath}/${pkg.name}`,
        });
      }

      return res.json(response);
    } catch (err) {
      if (err instanceof Error) {
        return res.json({
          error: err.message,
        });
      }
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
        await this.handleUpload(req, res);
      });
    } catch (error) {
      sendError(error);
      res.status(400);
    }
  }
}

export default SimpleUploadController;
