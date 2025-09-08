"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ChecksController_1 = __importDefault(require("../controllers/ChecksController"));
const ChecksRouter = () => {
    const router = express_1.default.Router();
    const controller = new ChecksController_1.default();
    /**
     * @swagger
     * /api/checks:
     *   get:
     *     summary: Health check
     *     description: Check the health and status of the API server
     *     tags: [System]
     *     responses:
     *       200:
     *         description: Server is healthy and operational
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   enum: [ok, healthy]
     *                   description: Server status
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                   description: Check timestamp
     *                 uptime:
     *                   type: number
     *                   description: Server uptime in seconds
     *                 version:
     *                   type: string
     *                   description: API version
     *       503:
     *         description: Server is unhealthy
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/api/checks', (req, res) => controller.getStatusCheck(req, res));
    return router;
};
exports.default = ChecksRouter;
//# sourceMappingURL=ChecksRouter.js.map