import express from 'express';

import RequireAllowedOrigin from '../../middleware/RequireAllowedOrigin';
import RequireAuthentication from '../../middleware/RequireAuthentication';
import StorageHandler from '../../lib/storage/StorageHandler';
import handleUpload from './helpers/handleUpload';
import getAllJobs from './getAllJobs';
import deleteUpload from './deleteUpload';
import getUploads from './getUploads';
import deleteJob from './deleteJob';
import upload from './upload';
import { sendError } from '../../lib/error/sendError';

const router = express.Router();

const storage = new StorageHandler();

router.post('/file', RequireAllowedOrigin, async (req, res) => {
  const u = upload(storage);

  u(req, res, (error) => {
    if (error) {
      sendError(error);
      return res.status(500).end();
    }
    handleUpload(storage, req, res);
  });
});

router.get('/mine', RequireAuthentication, getUploads);
router.get('/jobs', RequireAuthentication, getAllJobs);
router.delete('/jobs/:id', RequireAuthentication, deleteJob);
router.delete('/mine/:key', RequireAuthentication, deleteUpload);

export default router;
