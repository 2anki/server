import express from 'express';
import multer from 'multer';

import ImageOcclusionController from '../controllers/ImageOcclusionController';
import { IoDraftController } from '../controllers/IoDraftController';
import { CreateImageOcclusionDeckUseCase } from '../usecases/imageOcclusion/CreateImageOcclusionDeckUseCase';
import { IoDraftRepository } from '../data_layer/IoDraftRepository';
import { getDatabase } from '../data_layer';
import StorageHandler from '../lib/storage/StorageHandler';
import RequireAuthentication from './middleware/RequireAuthentication';

const ImageOcclusionRouter = () => {
  const router = express.Router();
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const upload = multer({
    dest: '/tmp',
    fileFilter: (_req, file, cb) => {
      cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype));
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  const occlusionController = new ImageOcclusionController(
    new CreateImageOcclusionDeckUseCase()
  );

  const draftController = new IoDraftController(
    new IoDraftRepository(getDatabase()),
    new StorageHandler()
  );

  router.post(
    '/api/image-occlusion',
    upload.array('images', 20),
    (req, res) => occlusionController.create(req, res)
  );

  router.post(
    '/api/image-occlusion/draft/image',
    RequireAuthentication,
    upload.single('image'),
    (req, res) => draftController.uploadImage(req, res)
  );

  router.post(
    '/api/image-occlusion/draft',
    RequireAuthentication,
    express.json(),
    (req, res) => draftController.create(req, res)
  );

  router.put(
    '/api/image-occlusion/draft/:id',
    RequireAuthentication,
    express.json(),
    (req, res) => draftController.update(req, res)
  );

  router.get(
    '/api/image-occlusion/drafts',
    RequireAuthentication,
    (req, res) => draftController.list(req, res)
  );

  router.get(
    '/api/image-occlusion/draft/:id',
    RequireAuthentication,
    (req, res) => draftController.get(req, res)
  );

  router.delete(
    '/api/image-occlusion/draft/:id',
    RequireAuthentication,
    (req, res) => draftController.remove(req, res)
  );

  return router;
};

export default ImageOcclusionRouter;
