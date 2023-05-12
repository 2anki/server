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
import { getLimitMessage } from '../../lib/misc/getLimitMessage';

const router = express.Router();

const storage = new StorageHandler();

router.post('/file', RequireAllowedOrigin, (req, res) => {
  const handleUploadEndpoint = upload(res, storage);

  handleUploadEndpoint(req, res, (error) => {
    if (error) {
      let msg = error.message;
      if (msg === 'File too large') {
        msg = getLimitMessage();
      } else {
        sendError(error);
      }
      return res.status(500).send(msg);
    }
    handleUpload(storage, req, res);
  });
});

router.get('/mine', RequireAuthentication, getUploads);
router.get('/jobs', RequireAuthentication, getAllJobs);
router.delete('/jobs/:id', RequireAuthentication, deleteJob);
router.delete('/mine/:key', RequireAuthentication, deleteUpload);

export default router;
