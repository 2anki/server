"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deleteOldFiles;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const find_remove_1 = __importDefault(require("find-remove"));
const constants_1 = require("../../../constants");
/**
 * Locally stored files are deleted after 21 minutes. This is to prevent the server from running out of space.
 * It will not affect files processed by the Notion integration which are stored in DigitalOcean space.
 * @param loc
 */
function deleteFile(loc) {
    console.time(`finding & removing ${loc} files older than 21 minutes`);
    (0, find_remove_1.default)(path_1.default.join(os_1.default.tmpdir(), loc), {
        files: '*.*',
        age: { seconds: constants_1.TIME_21_MINUTES_AS_SECONDS },
    });
    console.timeEnd(`finding & removing ${loc} files older than 21 minutes`);
}
/**
 * A convenience function to batch delete old files.
 * @param locations
 */
function deleteOldFiles(locations) {
    locations.forEach((loc) => {
        deleteFile(loc);
    });
}
//# sourceMappingURL=deleteOldFiles.js.map