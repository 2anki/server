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
Object.defineProperty(exports, "__esModule", { value: true });
const getOwner_1 = require("../../lib/User/getOwner");
const GetUploadHandler_1 = require("../../lib/misc/GetUploadHandler");
const isLimitError_1 = require("../../lib/misc/isLimitError");
const handleUploadLimitError_1 = require("./helpers/handleUploadLimitError");
const handleDropbox_1 = require("./helpers/handleDropbox");
const handleGoogleDrive_1 = require("./helpers/handleGoogleDrive");
class UploadController {
    constructor(service, notionService) {
        this.service = service;
        this.notionService = notionService;
    }
    deleteUpload(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (0, getOwner_1.getOwner)(res);
            const { key } = req.params;
            if (!key) {
                return res.status(400).send();
            }
            try {
                yield this.service.deleteUpload(owner, key);
                yield this.notionService.purgeBlockCache(owner);
            }
            catch (error) {
                console.info('Delete upload failed');
                console.error(error);
                return res.status(500).send();
            }
            return res.status(200).send();
        });
    }
    getUploads(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (0, getOwner_1.getOwner)(res);
            try {
                const uploads = yield this.service.getUploadsByOwner(owner);
                res.json(uploads);
            }
            catch (error) {
                console.info('Get uploads failed');
                console.error(error);
                res.status(400);
            }
        });
    }
    file(req, res) {
        try {
            console.info('uploading file');
            const handleUploadEndpoint = (0, GetUploadHandler_1.getUploadHandler)(res);
            handleUploadEndpoint(req, res, (error) => __awaiter(this, void 0, void 0, function* () {
                if ((0, isLimitError_1.isLimitError)(error)) {
                    return (0, handleUploadLimitError_1.handleUploadLimitError)(req, res);
                }
                yield this.service.handleUpload(req, res);
            }));
        }
        catch (error) {
            console.info('Upload file failed');
            console.error(error);
            res.status(400);
        }
    }
    dropbox(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, handleDropbox_1.handleDropbox)(req, res, this.service.handleUpload).then(() => {
                console.debug('dropbox upload success');
            });
        });
    }
    googleDrive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, handleGoogleDrive_1.handleGoogleDrive)(req, res, this.service.handleUpload).then(() => {
                console.debug('google drive upload success');
            });
        });
    }
}
exports.default = UploadController;
//# sourceMappingURL=UploadController.js.map