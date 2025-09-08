"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompress = decompress;
const unpack_1 = require("./unpack");
const writeFile_1 = require("./writeFile");
function decompress(byteArray) {
    const { workspace, filePath } = (0, writeFile_1.writeFile)(byteArray);
    return (0, unpack_1.unpack)(filePath, workspace.location);
}
//# sourceMappingURL=decompress.js.map