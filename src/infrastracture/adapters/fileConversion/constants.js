"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERTEX_AI_CONFIG = exports.SAFETY_SETTINGS = void 0;
const vertexai_1 = require("@google-cloud/vertexai");
exports.SAFETY_SETTINGS = [
    {
        category: vertexai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: vertexai_1.HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: vertexai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: vertexai_1.HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: vertexai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: vertexai_1.HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: vertexai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: vertexai_1.HarmBlockThreshold.BLOCK_NONE,
    },
];
exports.VERTEX_AI_CONFIG = {
    project: 'notion-to-anki',
    location: 'europe-north1',
    model: 'gemini-2.0-flash-001',
    generationConfig: {
        maxOutputTokens: 8192,
        temperature: 1,
        topP: 0.95,
    },
};
//# sourceMappingURL=constants.js.map