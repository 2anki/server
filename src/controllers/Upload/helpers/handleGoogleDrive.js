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
exports.handleGoogleDrive = handleGoogleDrive;
const axios_1 = __importDefault(require("axios"));
const isPaying_1 = require("../../../lib/isPaying");
const getUploadLimits_1 = require("../../../lib/misc/getUploadLimits");
const handleUploadLimitError_1 = require("./handleUploadLimitError");
const data_layer_1 = require("../../../data_layer");
const getOwner_1 = require("../../../lib/User/getOwner");
const GoogleDriveRepository_1 = require("../../../data_layer/GoogleDriveRepository");
const isEmptyUpload_1 = require("./isEmptyUpload");
const getFilesOrEmpty_1 = require("./getFilesOrEmpty");
const createGoogleDriveDownloadLink_1 = require("./createGoogleDriveDownloadLink");
function handleGoogleDrive(req, res, handleUpload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('handling Google Drive files', req.body);
            const files = (0, getFilesOrEmpty_1.getFilesOrEmpty)(req.body);
            if ((0, isEmptyUpload_1.isEmptyUpload)(files)) {
                console.debug('No Google Drive files selected.');
                res.status(400).send('No Google Drive files selected, one is required.');
                return;
            }
            const googleDriveAuth = req.body.googleDriveAuth;
            if (googleDriveAuth === undefined ||
                googleDriveAuth === null ||
                googleDriveAuth === 'undefined' ||
                googleDriveAuth === 'null') {
                res.status(400).send('Google Drive authentication is missing.');
                return;
            }
            const paying = (0, isPaying_1.isPaying)(res.locals);
            const limits = (0, getUploadLimits_1.getUploadLimits)(paying);
            const totalSize = files.reduce((acc, file) => acc + file.sizeBytes, 0);
            if (!paying && totalSize > limits.fileSize) {
                (0, handleUploadLimitError_1.handleUploadLimitError)(req, res);
                return;
            }
            const repo = new GoogleDriveRepository_1.GoogleDriveRepository((0, data_layer_1.getDatabase)());
            const owner = (0, getOwner_1.getOwner)(res);
            if (owner) {
                yield repo.saveFiles(files, owner);
            }
            else {
                console.log('Not storing anon users Google Drive files');
            }
            // @ts-ignore
            req.files = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const contents = yield axios_1.default.get((0, createGoogleDriveDownloadLink_1.createGoogleDriveDownloadLink)(file), {
                    headers: {
                        Authorization: `Bearer ${googleDriveAuth}`,
                    },
                    responseType: 'blob',
                });
                return {
                    originalname: file.name,
                    size: file.sizeBytes,
                    buffer: contents.data,
                };
            })));
            handleUpload(req, res);
        }
        catch (error) {
            console.debug('Error handling Google files', error);
            res.status(400).send('Error handling Google Drive files');
        }
    });
}
//# sourceMappingURL=handleGoogleDrive.js.map