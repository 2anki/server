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
exports.MS_24_HOURS = exports.MS_21 = void 0;
exports.default = deleteOldUploads;
const constants_1 = require("../../../constants");
const StorageHandler_1 = __importDefault(require("../../StorageHandler"));
const deleteNonSubScriberUploadsInDatabase_1 = require("./deleteNonSubScriberUploadsInDatabase");
const deleteDanglingUploadsInBucket_1 = require("./deleteDanglingUploadsInBucket");
exports.MS_21 = constants_1.TIME_21_MINUTES_AS_SECONDS * 1000;
exports.MS_24_HOURS = 1000 * 60 * 60 * 24;
const deleteResolvedFeedbackAttachments = (db, storage) => __awaiter(void 0, void 0, void 0, function* () {
    const resolvedFeedback = yield db('feedback')
        .select('attachments')
        .where('is_acknowledged', true);
    for (const feedback of resolvedFeedback) {
        const attachments = JSON.parse(feedback.attachments);
        for (const attachment of attachments) {
            yield storage.delete(attachment);
        }
    }
    yield db('feedback').where('is_acknowledged', true).delete();
});
function deleteOldUploads(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = new StorageHandler_1.default();
        yield (0, deleteNonSubScriberUploadsInDatabase_1.deleteNonSubScriberUploadsInDatabase)(db, storage);
        yield (0, deleteDanglingUploadsInBucket_1.deleteDanglingUploadsInBucket)(db, storage);
        yield deleteResolvedFeedbackAttachments(db, storage);
    });
}
//# sourceMappingURL=deleteOldUploads.js.map