"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const IndexController_1 = __importDefault(require("../controllers/IndexController/IndexController"));
const ensureIsLoggedIn_1 = require("./middleware/ensureIsLoggedIn");
const upload = (0, multer_1.default)({
    limits: { fileSize: 25 * 1024 * 1024 },
    dest: process.env.FEEDBACK_DIR || '~/',
});
const DefaultRouter = () => {
    const controller = new IndexController_1.default();
    const router = express_1.default.Router();
    /**
     * @swagger
     * /index.html:
     *   get:
     *     summary: Get main application page
     *     description: Serve the main application index page
     *     tags: [Frontend]
     *     responses:
     *       200:
     *         description: Main application page rendered
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     *               description: HTML application page
     */
    router.get('/index.html', (req, res) => controller.getIndex(req, res));
    /**
     * @swagger
     * /search:
     *   get:
     *     summary: Search page (authenticated)
     *     description: Access the search functionality (requires authentication)
     *     tags: [Frontend]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Search page rendered for authenticated user
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     *               description: HTML search page
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const isLoggedIn = yield (0, ensureIsLoggedIn_1.ensureIsLoggedIn)(req, res);
        if (!isLoggedIn) {
            return;
        }
        controller.getIndex(req, res);
    }));
    /**
     * @swagger
     * /{path}:
     *   get:
     *     summary: Catch-all frontend routes
     *     description: Serve the main application for all non-API routes (SPA routing)
     *     tags: [Frontend]
     *     parameters:
     *       - in: path
     *         name: path
     *         required: false
     *         schema:
     *           type: string
     *         description: Any non-API path
     *     responses:
     *       200:
     *         description: Main application page for SPA routing
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     *               description: HTML application page
     */
    router.get(/^\/(?!api).*/, (req, res) => controller.getIndex(req, res));
    /**
     * @swagger
     * /api/contact-us:
     *   post:
     *     summary: Contact us form
     *     description: Submit a contact form with optional file attachments
     *     tags: [Support]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - email
     *               - message
     *             properties:
     *               name:
     *                 type: string
     *                 description: Sender's name
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Sender's email address
     *               message:
     *                 type: string
     *                 description: Contact message
     *               subject:
     *                 type: string
     *                 description: Message subject
     *               attachments:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *                 description: Optional file attachments (max 25MB per file)
     *     responses:
     *       200:
     *         description: Contact form submitted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Invalid form data or file too large
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Failed to send contact message
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/api/contact-us', upload.array('attachments'), (req, res) => controller.contactUs(req, res));
    return router;
};
exports.default = DefaultRouter;
//# sourceMappingURL=DefaultRouter.js.map