import express from 'express';

import RequireAuthentication from '../../../middleware/RequireAuthentication';
import DB from '../../../lib/storage/db';
import StorageHandler from '../../../lib/storage/StorageHandler';
import { captureException } from '@sentry/node';

const router = express.Router();

const storage = new StorageHandler();
router.get('/u/:key', RequireAuthentication, async (req, res) => {
  const { key } = req.params;
  console.debug(`download ${key}`);
  if (!key) {
    return res.status(400).send();
  }
  const { owner } = res.locals;
  const query = { key, owner };
  try {
    const match = await DB('uploads').where(query).returning(['key']).first();
    if (match) {
      const file = await storage.getFileContents(match.key);
      res.send(file.Body);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    // @ts-ignore
    if (error && error.code === 'NoSuchKey') {
      await DB('uploads').del().where(query);
      return res.redirect('/uploads');
    }
    console.info('unknown error');
    captureException(error);
  }
});

export default router;
