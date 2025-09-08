"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupVertexAI = setupVertexAI;
const vertexai_1 = require("@google-cloud/vertexai");
const constants_1 = require("./constants");
function setupVertexAI() {
    const vertexAI = new vertexai_1.VertexAI({
        project: constants_1.VERTEX_AI_CONFIG.project,
        location: constants_1.VERTEX_AI_CONFIG.location,
    });
    return vertexAI.getGenerativeModel({
        model: constants_1.VERTEX_AI_CONFIG.model,
        generationConfig: constants_1.VERTEX_AI_CONFIG.generationConfig,
        safetySettings: constants_1.SAFETY_SETTINGS,
    });
}
//# sourceMappingURL=vertexAIUtils.js.map