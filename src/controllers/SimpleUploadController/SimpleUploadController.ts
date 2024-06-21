import express from 'express';

import { sendError } from '../../lib/error/sendError';
import { getLimitMessage } from '../../lib/misc/getLimitMessage';
import { UploadedFile } from '../../lib/storage/types';

import { getUploadHandler } from '../../lib/misc/GetUploadHandler';
import { createPackages } from './createPackages';
import { CreatedDeck, createResponse } from './createResponse';
import { isPaying } from '../../lib/isPaying';

const getPayingErrorMessage = () => {
  return "There was an unknown error with your upload. Please try again. If the problem persists, please contact <a href='mailto:support@2anki.net'>support@2anki.net</a>.";
};

class SimpleUploadController {
  async handleUpload(req: express.Request, res: express.Response) {
    try {
      const packages = await createPackages(
        req.files as UploadedFile[],
        isPaying(res.locals),
        req.body
      );
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
          if (msg === 'File too large' && !isPaying(res.locals)) {
            msg = getLimitMessage();
          } else if (isPaying(res.locals)) {
            msg = getPayingErrorMessage();
            console.info('paying customer issue');
            sendError(error);
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
