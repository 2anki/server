"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RequireAuthentication_1 = __importDefault(require("./middleware/RequireAuthentication"));
const ParserRulesController_1 = __importDefault(require("../controllers/ParserRulesController"));
const ParserRulesRepository_1 = __importDefault(require("../data_layer/ParserRulesRepository"));
const ParserRulesService_1 = __importDefault(require("../services/ParserRulesService"));
const data_layer_1 = require("../data_layer");
const ParserRulesRouter = () => {
    const database = (0, data_layer_1.getDatabase)();
    const repository = new ParserRulesRepository_1.default(database);
    const service = new ParserRulesService_1.default(repository);
    const controller = new ParserRulesController_1.default(service);
    const router = express_1.default.Router();
    /**
     * @swagger
     * /api/rules/find/{id}:
     *   get:
     *     summary: Find parser rule
     *     description: Retrieve a specific parser rule by ID for the authenticated user
     *     tags: [Parser Rules]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Parser rule ID
     *     responses:
     *       200:
     *         description: Parser rule retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: Rule ID
     *                 name:
     *                   type: string
     *                   description: Rule name
     *                 pattern:
     *                   type: string
     *                   description: Regular expression pattern
     *                 replacement:
     *                   type: string
     *                   description: Replacement text
     *                 enabled:
     *                   type: boolean
     *                   description: Whether rule is enabled
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Rule not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/api/rules/find/:id', RequireAuthentication_1.default, (req, res) => controller.findRule(req, res));
    /**
     * @swagger
     * /api/rules/create/{id}:
     *   post:
     *     summary: Create parser rule
     *     description: Create a new parser rule for text processing and card generation
     *     tags: [Parser Rules]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Context ID for the rule
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - pattern
     *               - replacement
     *             properties:
     *               name:
     *                 type: string
     *                 description: Rule name
     *               pattern:
     *                 type: string
     *                 description: Regular expression pattern to match
     *               replacement:
     *                 type: string
     *                 description: Replacement text or pattern
     *               enabled:
     *                 type: boolean
     *                 default: true
     *                 description: Whether rule is enabled
     *               priority:
     *                 type: integer
     *                 description: Rule execution priority
     *     responses:
     *       201:
     *         description: Parser rule created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: Created rule ID
     *                 message:
     *                   type: string
     *                   description: Success message
     *       400:
     *         description: Invalid rule data or regex pattern
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
    router.post('/api/rules/create/:id', RequireAuthentication_1.default, (req, res) => controller.createRule(req, res));
    return router;
};
exports.default = ParserRulesRouter;
//# sourceMappingURL=ParserRulesRouter.js.map