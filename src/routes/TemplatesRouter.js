"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RequireAuthentication_1 = __importDefault(require("./middleware/RequireAuthentication"));
const TemplatesController_1 = __importDefault(require("../controllers/TemplatesController"));
const TemplatesRepository_1 = __importDefault(require("../data_layer/TemplatesRepository"));
const data_layer_1 = require("../data_layer");
const TemplatesService_1 = __importDefault(require("../services/TemplatesService"));
const TemplatesRouter = () => {
    const router = express_1.default.Router();
    const database = (0, data_layer_1.getDatabase)();
    const controller = new TemplatesController_1.default(new TemplatesService_1.default(new TemplatesRepository_1.default(database)));
    /**
     * @swagger
     * /api/templates/create:
     *   post:
     *     summary: Create template
     *     description: Create a new Anki card template for the authenticated user
     *     tags: [Templates]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - frontTemplate
     *               - backTemplate
     *             properties:
     *               name:
     *                 type: string
     *                 description: Template name
     *               frontTemplate:
     *                 type: string
     *                 description: HTML template for the front of the card
     *               backTemplate:
     *                 type: string
     *                 description: HTML template for the back of the card
     *               css:
     *                 type: string
     *                 description: CSS styling for the template
     *               description:
     *                 type: string
     *                 description: Template description
     *     responses:
     *       201:
     *         description: Template created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: Template ID
     *                 message:
     *                   type: string
     *                   description: Success message
     *       400:
     *         description: Invalid template data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/api/templates/create', RequireAuthentication_1.default, (req, res) => controller.createTemplate(req, res));
    /**
     * @swagger
     * /api/templates/delete:
     *   post:
     *     summary: Delete template
     *     description: Delete a template created by the authenticated user
     *     tags: [Templates]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id
     *             properties:
     *               id:
     *                 type: string
     *                 description: Template ID to delete
     *     responses:
     *       200:
     *         description: Template deleted successfully
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
     *         description: Template not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/api/templates/delete', RequireAuthentication_1.default, (req, res) => controller.deleteTemplate(req, res));
    return router;
};
exports.default = TemplatesRouter;
//# sourceMappingURL=TemplatesRouter.js.map