"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const RequireAllowedOrigin_1 = __importDefault(require("./middleware/RequireAllowedOrigin"));
const RequireAuthentication_1 = __importDefault(require("./middleware/RequireAuthentication"));
const UploadController_1 = __importDefault(require("../controllers/Upload/UploadController"));
const JobController_1 = __importDefault(require("../controllers/JobController"));
const JobService_1 = __importDefault(require("../services/JobService"));
const JobRepository_1 = __importDefault(require("../data_layer/JobRepository"));
const UploadService_1 = __importDefault(require("../services/UploadService"));
const data_layer_1 = require("../data_layer");
const UploadRespository_1 = __importDefault(require("../data_layer/UploadRespository"));
const NotionRespository_1 = __importDefault(require("../data_layer/NotionRespository"));
const NotionService_1 = __importDefault(require("../services/NotionService"));
const UploadRouter = () => {
    const router = express_1.default.Router();
    const database = (0, data_layer_1.getDatabase)();
    const jobController = new JobController_1.default(new JobService_1.default(new JobRepository_1.default(database)));
    const uploadController = new UploadController_1.default(new UploadService_1.default(new UploadRespository_1.default(database)), new NotionService_1.default(new NotionRespository_1.default(database)));
    /**
     * This API is open to the public and therefore does not require authentication.
     * It is used to upload files to the server, and there is a whitelist in place to prevent
     * abuse. In the future, this API will be moved to a separate server.
     */
    /**
     * @swagger
     * /api/upload/file:
     *   post:
     *     summary: Upload a file
     *     description: Upload a file to be converted to Anki flashcards. This endpoint is public but has origin restrictions.
     *     tags: [Upload]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: The file to upload (PDF, DOCX, etc.)
     *               options:
     *                 type: string
     *                 description: JSON string with conversion options
     *     responses:
     *       200:
     *         description: File uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Upload'
     *       400:
     *         description: Invalid file or request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Origin not allowed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/api/upload/file', RequireAllowedOrigin_1.default, (req, res) => uploadController.file(req, res));
    /**
     * @swagger
     * /api/upload/dropbox:
     *   post:
     *     summary: Upload from Dropbox
     *     description: Import a file from Dropbox to be converted to Anki flashcards
     *     tags: [Upload]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - link
     *             properties:
     *               link:
     *                 type: string
     *                 format: uri
     *                 description: Dropbox share link to the file
     *               filename:
     *                 type: string
     *                 description: Original filename
     *               options:
     *                 type: object
     *                 description: Upload and conversion options
     *     responses:
     *       200:
     *         description: Dropbox file imported successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Upload'
     *       400:
     *         description: Invalid Dropbox link or request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Origin not allowed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/api/upload/dropbox', RequireAllowedOrigin_1.default, (0, multer_1.default)({ dest: '/tmp' }).none(), (req, res) => uploadController.dropbox(req, res));
    /**
     * @swagger
     * /api/upload/google_drive:
     *   post:
     *     summary: Upload from Google Drive
     *     description: Import a file from Google Drive to be converted to Anki flashcards
     *     tags: [Upload]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               fileId:
     *                 type: string
     *                 description: Google Drive file ID
     *               filename:
     *                 type: string
     *                 description: Original filename
     *     responses:
     *       200:
     *         description: Google Drive file imported successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Upload'
     *       400:
     *         description: Invalid Google Drive file ID or request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/api/upload/google_drive', RequireAllowedOrigin_1.default, (0, multer_1.default)({ dest: '/tmp' }).none(), (req, res) => uploadController.googleDrive(req, res));
    /**
     * @swagger
     * /api/upload/mine:
     *   get:
     *     summary: Get user's uploads
     *     description: Retrieve all uploads belonging to the authenticated user
     *     tags: [Upload]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of user uploads retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Upload'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/api/upload/mine', RequireAuthentication_1.default, (req, res) => uploadController.getUploads(req, res));
    /**
     * @swagger
     * /api/upload/jobs:
     *   get:
     *     summary: Get user's conversion jobs
     *     description: Retrieve all conversion jobs belonging to the authenticated user
     *     tags: [Jobs]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of user jobs retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                   status:
     *                     type: string
     *                     enum: [pending, processing, completed, failed]
     *                   title:
     *                     type: string
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/api/upload/jobs', RequireAuthentication_1.default, (req, res) => jobController.getJobsByOwner(req, res));
    /**
     * @swagger
     * /api/upload/jobs/{id}:
     *   delete:
     *     summary: Delete a conversion job
     *     description: Delete a specific conversion job belonging to the authenticated user
     *     tags: [Jobs]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Job ID to delete
     *     responses:
     *       200:
     *         description: Job deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Job not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.delete('/api/upload/jobs/:id', RequireAuthentication_1.default, (req, res) => jobController.deleteJobByOwner(req, res));
    /**
     * @swagger
     * /api/upload/mine/{key}:
     *   delete:
     *     summary: Delete an upload
     *     description: Delete a specific upload belonging to the authenticated user
     *     tags: [Upload]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: key
     *         required: true
     *         schema:
     *           type: string
     *         description: Upload key/ID to delete
     *     responses:
     *       200:
     *         description: Upload deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Upload not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.delete('/api/upload/mine/:key', RequireAuthentication_1.default, (req, res) => uploadController.deleteUpload(req, res));
    return router;
};
exports.default = UploadRouter;
//# sourceMappingURL=UploadRouter.js.map