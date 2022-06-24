import express from 'express';

import RequireAllowedOrigin from '../../middleware/RequireAllowedOrigin';
import RequireAuthentication from '../../middleware/RequireAuthentication';
import StorageHandler from '../../lib/storage/StorageHandler';
import handleUpload from './helpers/handleUpload';
import getActiveJobs from './getActiveJobs';
import deleteUpload from './deleteUpload';
import getUploads from './getUploads';
import deleteJob from './deleteJob';
import upload from './upload';

const router = express.Router();

const storage = new StorageHandler();

router.post('/file', RequireAllowedOrigin, (req, res) => {
  const u = upload(storage, res.locals.patreon);

  u(req, res, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).end();
    }
    handleUpload(storage, req, res);
  });
});

router.get('/mine', RequireAuthentication, getUploads);
router.get('/active', RequireAuthentication, getActiveJobs);
router.delete('/active/:id', RequireAuthentication, deleteJob);
router.delete('/mine/:key', RequireAuthentication, deleteUpload);

export default router;
