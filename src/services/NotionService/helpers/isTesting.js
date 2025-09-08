"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isTesting;
function isTesting() {
    return process.env.JEST_WORKER_ID !== undefined;
}
//# sourceMappingURL=isTesting.js.map