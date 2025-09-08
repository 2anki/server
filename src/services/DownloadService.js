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
class DownloadService {
    constructor(downloadRepository) {
        this.downloadRepository = downloadRepository;
    }
    getFileBody(owner, key, storage) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileEntry = yield this.downloadRepository.getFile(owner, key);
            if (!fileEntry) {
                return null;
            }
            const file = yield storage.getFileContents(fileEntry.key);
            return file === null || file === void 0 ? void 0 : file.Body;
        });
    }
    isValidKey(key) {
        return key && key.length > 0;
    }
    isMissingDownloadError(error) {
        const errorName = error === null || error === void 0 ? void 0 : error.name;
        return errorName === null || errorName === void 0 ? void 0 : errorName.match(/NoSuchKey/);
    }
    deleteMissingFile(owner, key) {
        this.downloadRepository.deleteMissingFile(owner, key);
    }
}
exports.default = DownloadService;
//# sourceMappingURL=DownloadService.js.map