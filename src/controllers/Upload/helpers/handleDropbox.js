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
exports.handleDropbox = handleDropbox;
const axios_1 = __importDefault(require("axios"));
const DropboxRepository_1 = require("../../../data_layer/DropboxRepository");
const isPaying_1 = require("../../../lib/isPaying");
const getUploadLimits_1 = require("../../../lib/misc/getUploadLimits");
const handleUploadLimitError_1 = require("./handleUploadLimitError");
const data_layer_1 = require("../../../data_layer");
const getOwner_1 = require("../../../lib/User/getOwner");
const isEmptyUpload_1 = require("./isEmptyUpload");
const getFilesOrEmpty_1 = require("./getFilesOrEmpty");
function handleDropbox(req, res, handleUpload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = (0, getFilesOrEmpty_1.getFilesOrEmpty)(req.body);
            if ((0, isEmptyUpload_1.isEmptyUpload)(files)) {
                console.debug('No dropbox files selected.');
                res
                    .status(400)
                    .json({ error: 'No dropbox files selected, one is required.' });
                return;
            }
            const paying = (0, isPaying_1.isPaying)(res.locals);
            const limits = (0, getUploadLimits_1.getUploadLimits)(paying);
            const totalSize = files.reduce((acc, file) => acc + file.bytes, 0);
            if (!paying && totalSize > limits.fileSize) {
                (0, handleUploadLimitError_1.handleUploadLimitError)(req, res);
                return;
            }
            const repo = new DropboxRepository_1.DropboxRepository((0, data_layer_1.getDatabase)());
            const owner = (0, getOwner_1.getOwner)(res);
            if (owner) {
                yield repo.saveFiles(files, owner);
            }
            else {
                console.log('Not storing anon users dropbox files');
            }
            // @ts-ignore
            req.files = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const contents = yield axios_1.default.get(file.link, {
                    responseType: 'arraybuffer',
                });
                return {
                    originalname: file.name,
                    size: file.bytes,
                    buffer: contents.data,
                };
            })));
            handleUpload(req, res);
        }
        catch (error) {
            console.debug('Error handling dropbox files', error);
            res.status(400).json({ error: 'Error handling dropbox files' });
        }
    });
}
//# sourceMappingURL=handleDropbox.js.map