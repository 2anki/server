"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFileSystemCleanup = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const deleteOldFiles_1 = __importDefault(require("./deleteOldFiles"));
const data_layer_1 = require("../../../../data_layer");
const runFileSystemCleanup = (database) => {
    var _a, _b;
    console.time('running cleanup');
    const locations = [
        (_a = process.env.WORKSPACE_BASE) !== null && _a !== void 0 ? _a : path_1.default.join(os_1.default.tmpdir(), 'workspaces'),
        (_b = process.env.UPLOAD_BASE) !== null && _b !== void 0 ? _b : path_1.default.join(os_1.default.tmpdir(), 'uploads'),
    ];
    (0, deleteOldFiles_1.default)(locations);
    database.raw("DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '14 days' AND status = 'failed'");
    console.timeEnd('running cleanup');
};
exports.runFileSystemCleanup = runFileSystemCleanup;
if (require.main === module) {
    (0, exports.runFileSystemCleanup)((0, data_layer_1.getDatabase)());
    console.log('Cleanup complete');
}
//# sourceMappingURL=runFileSystemCleanup.js.map