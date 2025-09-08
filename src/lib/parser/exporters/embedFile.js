"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedFile = void 0;
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const file_1 = require("../../misc/file");
const getUniqueFileName_1 = __importDefault(require("../../misc/getUniqueFileName"));
const getFile = (exporter, files, filePath, workspace) => {
    const fullPath = path_1.default.resolve(workspace.location, filePath);
    if (fullPath.startsWith(workspace.location) && (0, fs_1.existsSync)(fullPath)) {
        const buffer = fs_1.default.readFileSync(fullPath);
        return {
            name: fullPath,
            contents: buffer,
        };
    }
    const asRootFile = files.find((f) => f.name === filePath);
    if (asRootFile) {
        return asRootFile;
    }
    const parent = exporter.firstDeckName.replace(/.html /, '/');
    const asChildFile = files.find((f) => f.name === `${parent}/${filePath}`);
    if (asChildFile) {
        return asChildFile;
    }
    /*
     * Could not find file, try to find it by ending.
     * This happens in deeply nested directories.
     * Example: using a huge database
     */
    const normalized = filePath.replace(/\.\.\//g, '');
    const usingSuffix = files.find((f) => f.name.endsWith(filePath) || f.name.endsWith(normalized));
    if (usingSuffix) {
        return usingSuffix;
    }
    return undefined;
};
const embedFile = (input) => {
    const { exporter, files, filePath, workspace } = input;
    const suffix = (0, file_1.SuffixFrom)(filePath);
    const file = getFile(exporter, files, filePath, workspace);
    /**
     * The found file can be a file path in the workspace or a file in the zip or url.
     * The contents is used first to avoid name conflicts. URL can have conflicts but so far
     * no bug reports.
     */
    if (file) {
        const contents = file.contents;
        const newName = (0, getUniqueFileName_1.default)(contents !== null && contents !== void 0 ? contents : filePath) + suffix;
        if (contents) {
            exporter.addMedia(newName, contents);
        }
        return newName;
    }
    console.debug(JSON.stringify({
        hint: 'Missing relative path',
        filePath: filePath,
        fileNames: files.map((f) => f.name),
    }));
    return null;
};
exports.embedFile = embedFile;
//# sourceMappingURL=embedFile.js.map