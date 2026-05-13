import express from "express";
import multer from "multer";
import RequireAuthentication from "./middleware/RequireAuthentication";
import ImageOcclusionController from "../controllers/ImageOcclusionController";
import { IoDraftController } from "../controllers/IoDraftController";
import { CreateImageOcclusionDeckUseCase } from "../usecases/imageOcclusion/CreateImageOcclusionDeckUseCase";
import { IoDraftRepository } from "../data_layer/IoDraftRepository";
import { getDatabase } from "../data_layer";
import StorageHandler from "../lib/storage/StorageHandler";

const ImageOcclusionRouter = () => {
  const router = express.Router();
  const ALLOWED = ["image/jpeg","image/png","image/webp","image/gif"];
  const upload = multer({ dest:"/tmp", fileFilter:(_req,file,cb)=>{ cb(null,ALLOWED.includes(file.mimetype)); }, limits:{fileSize:10*1024*1024} });
  const oc = new ImageOcclusionController(new CreateImageOcclusionDeckUseCase());
  const dc = new IoDraftController(new IoDraftRepository(getDatabase()), new StorageHandler());

  /**
   * @swagger
   * /api/image-occlusion:
   *   post:
   *     summary: Generate an image occlusion Anki deck
   *     tags: [ImageOcclusion]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Anki deck generated
   */
  router.post("/api/image-occlusion", upload.array("images",20), (req,res)=>oc.create(req,res));

  /**
   * @swagger
   * /api/image-occlusion/draft/image:
   *   post:
   *     summary: Upload an image for an occlusion draft
   *     tags: [ImageOcclusion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Image uploaded, returns s3Key and presignedUrl
   *       401:
   *         description: Authentication required
   */
  router.post("/api/image-occlusion/draft/image", RequireAuthentication, upload.single("image"), (req,res)=>dc.uploadImage(req,res));

  /**
   * @swagger
   * /api/image-occlusion/draft:
   *   post:
   *     summary: Create a new occlusion draft
   *     tags: [ImageOcclusion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       201:
   *         description: Draft created, returns id
   *       401:
   *         description: Authentication required
   */
  router.post("/api/image-occlusion/draft", RequireAuthentication, express.json(), (req,res)=>dc.create(req,res));

  /**
   * @swagger
   * /api/image-occlusion/draft/{id}:
   *   put:
   *     summary: Update an occlusion draft
   *     tags: [ImageOcclusion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Draft updated
   *       401:
   *         description: Authentication required
   */
  router.put("/api/image-occlusion/draft/:id", RequireAuthentication, express.json(), (req,res)=>dc.update(req,res));

  /**
   * @swagger
   * /api/image-occlusion/drafts:
   *   get:
   *     summary: List occlusion drafts for the authenticated user
   *     tags: [ImageOcclusion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: List of drafts
   *       401:
   *         description: Authentication required
   */
  router.get("/api/image-occlusion/drafts", RequireAuthentication, (req,res)=>dc.list(req,res));

  /**
   * @swagger
   * /api/image-occlusion/draft/{id}:
   *   get:
   *     summary: Get a single occlusion draft
   *     tags: [ImageOcclusion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Draft data with presigned image URLs
   *       401:
   *         description: Authentication required
   *       404:
   *         description: Draft not found
   */
  router.get("/api/image-occlusion/draft/:id", RequireAuthentication, (req,res)=>dc.get(req,res));

  /**
   * @swagger
   * /api/image-occlusion/draft/{id}:
   *   delete:
   *     summary: Delete an occlusion draft and its S3 images
   *     tags: [ImageOcclusion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Draft deleted
   *       401:
   *         description: Authentication required
   */
  router.delete("/api/image-occlusion/draft/:id", RequireAuthentication, (req,res)=>dc.remove(req,res));

  return router;
};
export default ImageOcclusionRouter;
