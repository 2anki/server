import express from 'express';
import multer from 'multer';

import ImageOcclusionController from '../controllers/ImageOcclusionController';
import { CreateImageOcclusionDeckUseCase } from '../usecases/imageOcclusion/CreateImageOcclusionDeckUseCase';

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
  const controller = new ImageOcclusionController(
    new CreateImageOcclusionDeckUseCase()
  );

  router.post(
    '/api/image-occlusion',
    upload.array('images', 20),
    (req, res) => controller.create(req, res)
  );

  return router;
};

export default ImageOcclusionRouter;
