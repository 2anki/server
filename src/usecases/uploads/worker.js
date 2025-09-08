"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const Package_1 = __importDefault(require("../../lib/parser/Package"));
const fs_1 = __importDefault(require("fs"));
const PrepareDeck_1 = require("../../infrastracture/adapters/fileConversion/PrepareDeck");
const checks_1 = require("../../lib/storage/checks");
const getPackagesFromZip_1 = require("./getPackagesFromZip");
const isZipContentFileSupported_1 = require("./isZipContentFileSupported");
/**
 * Get file contents from either path or buffer
 */
function getFileContents(file) {
    if (!file.path) {
        return file.buffer;
    }
    try {
        // Check if a file exists before trying to read it
        if (fs_1.default.existsSync(file.path)) {
            return fs_1.default.readFileSync(file.path);
        }
        console.warn(`File not found at path: ${file.path}, using buffer instead`);
    }
    catch (error) {
        console.error(`Error reading file at path: ${file.path}`, error);
    }
    return file.buffer;
}
/**
 * Process a single file and return packages
 */
function processFile(file, fileContents, paying, settings, workspace) {
    return __awaiter(this, void 0, void 0, function* () {
        const packages = [];
        const filename = file.originalname;
        const key = file.key;
        // Check if it's a valid single file
        const allowImageQuizHtmlToAnki = paying && settings.imageQuizHtmlToAnki && (0, checks_1.isImageFile)(filename);
        const isValidSingleFile = (0, isZipContentFileSupported_1.isZipContentFileSupported)(filename) ||
            (0, checks_1.isPPTFile)(filename) ||
            allowImageQuizHtmlToAnki;
        if (isValidSingleFile) {
            const d = yield (0, PrepareDeck_1.PrepareDeck)({
                name: filename,
                files: [{ name: filename, contents: fileContents }],
                settings,
                noLimits: paying,
                workspace,
            });
            if (d) {
                packages.push(new Package_1.default(d.name));
            }
        }
        // Check if it's a compressed file
        else if ((0, checks_1.isCompressedFile)(filename) || (0, checks_1.isCompressedFile)(key)) {
            const { packages: extraPackages } = yield (0, getPackagesFromZip_1.getPackagesFromZip)(fileContents, paying, settings, workspace);
            packages.push(...extraPackages);
        }
        return packages;
    });
}
function doGenerationWork(data) {
    console.log('doGenerationWork');
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        console.log('starting generation');
        const { paying, files, settings, workspace } = data;
        let packages = [];
        for (const file of files) {
            const fileContents = getFileContents(file);
            const filePackages = yield processFile(file, fileContents, paying, settings, workspace);
            packages = packages.concat(filePackages);
        }
        resolve({ packages });
    }));
}
doGenerationWork(worker_threads_1.workerData.data)
    .then((result) => {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(result);
})
    .catch(worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage);
//# sourceMappingURL=worker.js.map