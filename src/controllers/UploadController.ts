import fs from 'fs';
import path from 'path';

import express, { Response } from 'express';
import crypto from 'crypto';

import { getOwner } from '../lib/User/getOwner';
import { ZipHandler } from '../lib/anki/zip';
import { TEMPLATE_DIR } from '../lib/constants';
import { sendError } from '../lib/error/sendError';
import { getLimitMessage } from '../lib/misc/getLimitMessage';
import Package from '../lib/parser/Package';
import StorageHandler from '../lib/storage/StorageHandler';
import NotionService from '../services/NotionService';
import UploadService from '../services/UploadService';
import { toText } from '../services/NotionService/BlockHandler/helpers/deckNameToText';
import { getRandomUUID } from '../shared/helpers/getRandomUUID';

const setFilename = (res: Response, filename: string) => {
  try {
    res.set('File-Name', toText(filename));
  } catch (err) {
    sendError(err);
  }
};

function loadREADME(): string {
  return fs.readFileSync(path.join(TEMPLATE_DIR, 'README.html')).toString();
}

export const sendBundle = async (packages: Package[], res: Response) => {
  const filename = `Your decks-${getRandomUUID()}.zip`;
  const payload = await ZipHandler.toZip(packages, loadREADME());
  setFilename(res, filename);
  res.status(200).send(payload);
};

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
    console.info('uploading file');
    console.time(req.path);
    const storage = new StorageHandler();
    const handleUploadEndpoint = this.service.getUploadHandler(res, storage);

    handleUploadEndpoint(req, res, async (error) => {
      if (error) {
        let msg = error.message;
        if (msg === 'File too large') {
          msg = getLimitMessage();
        } else {
          sendError(error);
        }
        console.timeEnd(req.path);
        return res.status(500).send(msg);
      }
      await this.service.handleUpload(storage, req, res);
      console.timeEnd(req.path);
    });
  }
}

export default UploadController;
