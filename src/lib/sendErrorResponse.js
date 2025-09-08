"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendErrorResponse;
const src_1 = require("@notionhq/client/build/src");
function sendErrorResponse(error, response) {
    let status = 500;
    let body = { message: 'Unknown error.' };
    if (error instanceof src_1.APIResponseError) {
        status = error.status;
        body = { message: error.message };
    }
    console.error(error);
    return response.status(status).json(body).send();
}
//# sourceMappingURL=sendErrorResponse.js.map