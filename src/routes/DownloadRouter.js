"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RequireAuthentication_1 = __importDefault(require("./middleware/RequireAuthentication"));
const DownloadController_1 = __importDefault(require("../controllers/DownloadController"));
const DownloadService_1 = __importDefault(require("../services/DownloadService"));
const DownloadRepository_1 = __importDefault(require("../data_layer/DownloadRepository"));
const StorageHandler_1 = __importDefault(require("../lib/storage/StorageHandler"));
const data_layer_1 = require("../data_layer");
const DownloadRouter = () => {
    const database = (0, data_layer_1.getDatabase)();
    const repository = new DownloadRepository_1.default(database);
    const controller = new DownloadController_1.default(new DownloadService_1.default(repository));
    const router = express_1.default.Router();
    /**
     * @swagger
     * /api/download/u/{key}:
     *   get:
     *     summary: Download user file
     *     description: Download a file uploaded by the authenticated user using the file key
     *     tags: [Download]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: key
     *         required: true
     *         schema:
     *           type: string
     *         description: Unique file key for the upload
     *     responses:
     *       200:
     *         description: File download successful
     *         content:
     *           application/octet-stream:
     *             schema:
     *               type: string
     *               format: binary
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: File not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/api/download/u/:key', RequireAuthentication_1.default, (req, res) => {
        const storage = new StorageHandler_1.default();
        controller.getFile(req, res, storage);
    });
    /**
     * @swagger
     * /download/{id}:
     *   get:
     *     summary: Get download page
     *     description: Display the download page for a converted file
     *     tags: [Download]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Download ID
     *     responses:
     *       200:
     *         description: Download page rendered successfully
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     *       404:
     *         description: Download not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/download/:id', (req, res) => {
        controller.getDownloadPage(req, res);
    });
    /**
     * @swagger
     * /download/{id}/bulk:
     *   get:
     *     summary: Bulk download
     *     description: Download multiple files as a bulk package (ZIP)
     *     tags: [Download]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Download ID for bulk package
     *     responses:
     *       200:
     *         description: Bulk download successful
     *         content:
     *           application/zip:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Download package not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/download/:id/bulk', (req, res) => {
        controller.getBulkDownload(req, res);
    });
    /**
     * @swagger
     * /download/{id}/{filename}:
     *   get:
     *     summary: Download specific file
     *     description: Download a specific file by ID and filename
     *     tags: [Download]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Download ID
     *       - in: path
     *         name: filename
     *         required: true
     *         schema:
     *           type: string
     *         description: Filename to download
     *     responses:
     *       200:
     *         description: File download successful
     *         content:
     *           application/octet-stream:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: File not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/download/:id/:filename', (req, res) => {
        controller.getLocalFile(req, res);
    });
    return router;
};
exports.default = DownloadRouter;
//# sourceMappingURL=DownloadRouter.js.map