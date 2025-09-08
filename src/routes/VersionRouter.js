"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VersionController_1 = __importDefault(require("../controllers/VersionController"));
const VersionService_1 = __importDefault(require("../services/VersionService"));
const VersionRouter = () => {
    const controller = new VersionController_1.default(new VersionService_1.default());
    const router = express_1.default.Router();
    /**
     * @swagger
     * /api/version:
     *   get:
     *     summary: Get API version information
     *     description: Returns the current version and build information of the API
     *     tags: [System]
     *     responses:
     *       200:
     *         description: Version information retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Version'
     *             example:
     *               version: "1.2.1"
     *               build: "2024-08-04"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/api/version', (req, res) => controller.getVersionInfo(req, res));
    return router;
};
exports.default = VersionRouter;
//# sourceMappingURL=VersionRouter.js.map