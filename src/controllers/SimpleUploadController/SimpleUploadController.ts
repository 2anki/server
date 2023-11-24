import express from 'express';

import { sendError } from '../../lib/error/sendError';
import { getLimitMessage } from '../../lib/misc/getLimitMessage';
import { UploadedFile } from '../../lib/storage/types';

import { getUploadHandler } from '../../lib/misc/GetUploadHandler';
import { createPackages } from './createPackages';
import { CreatedDeck, createResponse } from './createResponse';

class SimpleUploadController {
  async handleUpload(req: express.Request, res: express.Response) {
    try {
      const packages = await createPackages(
        req.files as UploadedFile[],
        res.locals.patreon,
        req.body
      );
      if (packages.length === 0) {
        return res.status(400).json({
          error: 'no decks created',
        });
      }

      const response: CreatedDeck[] = createResponse(packages);
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
