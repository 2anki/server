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
const ErrorHandler_1 = __importDefault(require("../routes/middleware/ErrorHandler"));
const Settings_1 = __importDefault(require("../lib/parser/Settings"));
const WorkSpace_1 = __importDefault(require("../lib/parser/WorkSpace"));
const StorageHandler_1 = __importDefault(require("../lib/storage/StorageHandler"));
const GeneratePackagesUseCase_1 = __importDefault(require("../usecases/uploads/GeneratePackagesUseCase"));
const deckNameToText_1 = require("./NotionService/BlockHandler/helpers/deckNameToText");
const isPaying_1 = require("../lib/isPaying");
const isLimitError_1 = require("../lib/misc/isLimitError");
const handleUploadLimitError_1 = require("../controllers/Upload/helpers/handleUploadLimitError");
const constants_1 = require("../lib/error/constants");
class UploadService {
    getUploadsByOwner(owner) {
        return this.uploadRepository.getUploadsByOwner(owner);
    }
    constructor(uploadRepository) {
        this.uploadRepository = uploadRepository;
    }
    deleteUpload(owner, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const s = new StorageHandler_1.default();
            yield this.uploadRepository.deleteUpload(owner, key);
            yield s.delete(key);
        });
    }
    handleUpload(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let payload;
                let plen;
                const settings = new Settings_1.default(req.body || {});
                const ws = new WorkSpace_1.default(true, 'fs');
                const useCase = new GeneratePackagesUseCase_1.default();
                const { packages } = yield useCase.execute((0, isPaying_1.isPaying)(res.locals), req.files, settings, ws);
                console.log('packages', packages);
                const first = packages[0];
                if (packages.length === 1) {
                    const apkg = yield ws.getFirstAPKG();
                    if (!apkg) {
                        const name = first ? first.name : 'untitled';
                        throw new Error(`Could not produce APKG for ${name}`);
                    }
                    payload = apkg;
                    plen = Buffer.byteLength(apkg);
                    res.set('Content-Type', 'application/apkg');
                    res.set('Content-Length', plen.toString());
                    first.name = (0, deckNameToText_1.toText)(first.name);
                    try {
                        res.set('File-Name', encodeURIComponent(first.name));
                    }
                    catch (err) {
                        console.info(`failed to set name ${first.name}`);
                        console.error(err);
                    }
                    res.attachment(`/${first.name}`);
                    return res.status(200).send(payload);
                }
                else if (packages.length > 1) {
                    const url = `/download/${ws.id}`;
                    res.status(300);
                    return res.redirect(url);
                }
                else {
                    (0, ErrorHandler_1.default)(res, req, constants_1.NO_PACKAGE_ERROR);
                }
            }
            catch (err) {
                if ((0, isLimitError_1.isLimitError)(err)) {
                    (0, handleUploadLimitError_1.handleUploadLimitError)(req, res);
                }
                else {
                    return (0, ErrorHandler_1.default)(res, req, err);
                }
            }
        });
    }
}
exports.default = UploadService;
//# sourceMappingURL=UploadService.js.map