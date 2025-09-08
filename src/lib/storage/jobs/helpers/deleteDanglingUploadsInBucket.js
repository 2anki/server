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
exports.deleteDanglingUploadsInBucket = void 0;
const MAX_KEYS = 100000;
const deleteDanglingUploadsInBucket = (db, storage) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = yield db.raw(`
    SELECT up.key
    FROM users u
    JOIN uploads up ON u.id = up.owner
    LEFT JOIN subscriptions s ON u.email = s.email OR u.email = s.linked_email
    WHERE s.active = true;
    `);
    const subScriberUploads = query.rows || [];
    const storedFiles = yield storage.getContents(MAX_KEYS);
    const nonPatreonFiles = (_a = storedFiles === null || storedFiles === void 0 ? void 0 : storedFiles.filter((f) => f.Key && !subScriberUploads.find((up) => up.key === f.Key))) !== null && _a !== void 0 ? _a : [];
    for (const file of nonPatreonFiles) {
        if (file.Key) {
            yield storage.delete(file.Key);
        }
    }
});
exports.deleteDanglingUploadsInBucket = deleteDanglingUploadsInBucket;
//# sourceMappingURL=deleteDanglingUploadsInBucket.js.map