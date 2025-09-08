"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preserveFilesForDebugging = preserveFilesForDebugging;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const getRandomUUID_1 = require("../../shared/helpers/getRandomUUID");
function preserveFilesForDebugging(request, uploadedFiles, err) {
    console.info('Preserving files for debugging...');
    const debugDirectory = path_1.default.join(os_1.default.tmpdir(), 'debug', (0, getRandomUUID_1.getRandomUUID)());
    console.info('Debug directory:', debugDirectory);
    try {
        if (!fs_1.default.existsSync(debugDirectory)) {
            fs_1.default.mkdirSync(debugDirectory, { recursive: true });
            console.log(`Created debug directory: ${debugDirectory}`);
        }
        fs_1.default.writeFileSync(`${debugDirectory}/request.json`, JSON.stringify(request.body, null, 2));
        const timestamp = new Date().toISOString();
        const errorMessage = `${timestamp} - ${err.name}: \n${err.message}\n${err.stack}`;
        console.info(errorMessage);
        fs_1.default.writeFileSync(`${debugDirectory}/error.txt`, errorMessage);
        uploadedFiles.forEach((file, index) => {
            const destPath = path_1.default.join(debugDirectory, `${index}-${path_1.default.basename(file.originalname)}`);
            const fileContents = fs_1.default.readFileSync(file.path);
            fs_1.default.writeFileSync(destPath, fileContents);
            console.log(`Copied file ${file.path} to ${destPath}`);
        });
    }
    catch (error) {
        console.error(`Error in perserveFilesForDebugging: ${error}`);
    }
}
//# sourceMappingURL=preserveFilesForDebugging.js.map