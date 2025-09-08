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
exports.convertPPTToPDF = convertPPTToPDF;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const child_process_1 = require("child_process");
function convertPPTToPDF(name, contents, workspace) {
    return new Promise((resolve, reject) => {
        const unoconvBin = process.platform === 'darwin'
            ? '/usr/local/bin/unoconv'
            : '/usr/bin/unoconv';
        const normalizedName = path_1.default.basename(name);
        const tempFile = path_1.default.join(workspace.location, normalizedName);
        promises_1.default.writeFile(tempFile, Buffer.from(contents))
            .then(() => {
            const pdfFile = path_1.default.join(workspace.location, path_1.default.basename(normalizedName, path_1.default.extname(normalizedName)) + '.pdf');
            const unoconvProcess = (0, child_process_1.spawn)(unoconvBin, ['-f', 'pdf', tempFile], {
                cwd: workspace.location,
            });
            let stdout = '';
            let stderr = '';
            unoconvProcess.stdout.on('data', (data) => {
                stdout += data;
            });
            unoconvProcess.stderr.on('data', (data) => {
                stderr += data;
            });
            unoconvProcess.on('close', (code) => __awaiter(this, void 0, void 0, function* () {
                yield promises_1.default.writeFile(path_1.default.join(workspace.location, 'stdout.log'), stdout);
                yield promises_1.default.writeFile(path_1.default.join(workspace.location, 'stderr.log'), stderr);
                if (code !== 0) {
                    yield promises_1.default.writeFile(path_1.default.join(workspace.location, 'error.log'), `Conversion failed with code ${code}`);
                    reject(new Error(`Conversion failed with code ${code}`));
                }
                else {
                    resolve(yield promises_1.default.readFile(pdfFile));
                }
            }));
        })
            .catch((err) => reject(new Error(err.message || 'File write failed')));
    });
}
//# sourceMappingURL=ConvertPPTToPDF.js.map