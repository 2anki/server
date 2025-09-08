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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const canAccess_1 = require("../lib/misc/canAccess");
const DownloadPage_1 = require("../ui/pages/DownloadPage");
class DownloadController {
    constructor(service) {
        this.service = service;
    }
    getFile(req, res, storage) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key } = req.params;
            if (!this.service.isValidKey(key)) {
                return res.status(400).send();
            }
            console.debug(`download ${key}`);
            const { owner } = res.locals;
            try {
                const body = yield this.service.getFileBody(owner, key, storage);
                if (body) {
                    res.send(body);
                }
                else {
                    throw new Error(`File not found: ${key}`);
                }
            }
            catch (error) {
                console.error(error);
                if (this.service.isMissingDownloadError(error)) {
                    this.service.deleteMissingFile(owner, key);
                    res.redirect('/uploads');
                }
                else {
                    console.info('Download failed');
                    console.error(error);
                    res
                        .status(404)
                        .send("Download link expire, try converting again <a href='/upload'>upload</a>");
                }
            }
        });
    }
    getDownloadPage(req, res) {
        const { id } = req.params;
        const workspaceBase = process.env.WORKSPACE_BASE;
        const workspace = path_1.default.join(workspaceBase, id);
        if (!fs_1.default.existsSync(workspace) || !(0, canAccess_1.canAccess)(workspace, workspaceBase)) {
            return res.status(404).end();
        }
        if (fs_1.default.statSync(workspace).isDirectory()) {
            fs_1.default.readdir(workspace, (err, files) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error reading directory');
                    return;
                }
                const page = (0, DownloadPage_1.DownloadPage)({
                    id,
                    files: files.filter((file) => file.endsWith('.apkg')),
                });
                res.send(page);
            });
        }
        else {
            const fileContent = fs_1.default.readFileSync(workspace, 'utf8');
            return res.send(fileContent);
        }
    }
    getLocalFile(req, res) {
        const { id, filename } = req.params;
        const workspaceBase = process.env.WORKSPACE_BASE;
        const workspace = path_1.default.join(workspaceBase, id);
        const filePath = path_1.default.join(workspace, filename);
        if (!(0, canAccess_1.canAccess)(filePath, workspace) || !fs_1.default.existsSync(filePath)) {
            return res.status(404).end();
        }
        return res.sendFile(filePath);
    }
    getBulkDownload(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const workspaceBase = process.env.WORKSPACE_BASE;
            const workspace = path_1.default.join(workspaceBase, id);
            if (!fs_1.default.existsSync(workspace) || !(0, canAccess_1.canAccess)(workspace, workspaceBase)) {
                return res.status(404).end();
            }
            if (!fs_1.default.statSync(workspace).isDirectory()) {
                return res.status(400).send('Not a valid workspace');
            }
            try {
                const allFiles = yield fs_1.default.promises.readdir(workspace);
                const ankiFiles = allFiles.filter((file) => file.endsWith('.apkg'));
                if (ankiFiles.length === 0) {
                    return res.status(404).send('No Anki deck files found');
                }
                const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
                archive.on('error', (err) => {
                    console.error('Archive error:', err);
                    res.status(500).send('Error creating bulk download');
                });
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename="anki-decks-${id}.zip"`);
                archive.pipe(res);
                ankiFiles.forEach((file) => {
                    const filePath = path_1.default.join(workspace, file);
                    if (fs_1.default.existsSync(filePath)) {
                        archive.file(filePath, { name: file });
                    }
                });
                archive.finalize();
            }
            catch (_a) {
                res.status(500).send('Error creating bulk download');
            }
        });
    }
}
exports.default = DownloadController;
//# sourceMappingURL=DownloadController.js.map