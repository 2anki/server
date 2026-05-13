import express from 'express';
import multer from 'multer';

import ImageOcclusionController from '../controllers/ImageOcclusionController';
import { CreateImageOcclusionDeckUseCase } from '../usecases/imageOcclusion/CreateImageOcclusionDeckUseCase';

const ImageOcclusionRouter = () => {
  const router = express.Router();
  const upload = multer({ dest: '/tmp' });
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
