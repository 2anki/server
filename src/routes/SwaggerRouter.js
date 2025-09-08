"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("../config/swagger");
const SwaggerRouter = () => {
    const router = express_1.default.Router();
    // Serve swagger JSON spec
    router.get('/docs/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swagger_1.swaggerSpec);
    });
    // Serve swagger UI
    router.use('/docs', swagger_ui_express_1.default.serve);
    router.get('/docs', swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, swagger_1.swaggerUiOptions));
    return router;
};
exports.default = SwaggerRouter;
//# sourceMappingURL=SwaggerRouter.js.map