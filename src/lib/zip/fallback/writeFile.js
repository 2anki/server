"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = writeFile;
const getRandomUUID_1 = require("../../../shared/helpers/getRandomUUID");
const WorkSpace_1 = __importDefault(require("../../parser/WorkSpace"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function writeFile(compressedData) {
    const uuid = (0, getRandomUUID_1.getRandomUUID)();
    const workspace = new WorkSpace_1.default(true, 'fs');
    const p = path_1.default.join(workspace.location, uuid);
    fs_1.default.writeFileSync(p, compressedData);
    return { workspace, filePath: p };
}
//# sourceMappingURL=writeFile.js.map