"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexFileContents = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("../../lib/constants");
const getIndexFileContents = () => {
    const indexFilePath = path_1.default.join(constants_1.BUILD_DIR, 'index.html');
    const contents = fs_1.default.readFileSync(indexFilePath, 'utf8');
    return contents;
};
exports.getIndexFileContents = getIndexFileContents;
//# sourceMappingURL=getIndexFileContents.js.map