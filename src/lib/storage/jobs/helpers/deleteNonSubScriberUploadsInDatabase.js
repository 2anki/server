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
exports.deleteNonSubScriberUploadsInDatabase = void 0;
const deleteNonSubScriberUploadsInDatabase = (db, storage) => __awaiter(void 0, void 0, void 0, function* () {
    const query = yield db.raw(`
    SELECT up.key 
    FROM users u 
    JOIN uploads up ON u.id = up.owner 
    LEFT JOIN subscriptions s ON u.email = s.email OR u.email = s.linked_email
    WHERE u.patreon = false AND (s.active IS NULL OR s.active = false);
  `);
    const nonSubScriberUploads = query.rows;
    if (!nonSubScriberUploads) {
        return;
    }
    for (const upload of nonSubScriberUploads.flat()) {
        console.info(`Deleting non-subscriber upload ${upload.key}`);
        yield storage.delete(upload.key);
        yield db('uploads').delete().where('key', upload.key);
    }
});
exports.deleteNonSubScriberUploadsInDatabase = deleteNonSubScriberUploadsInDatabase;
//# sourceMappingURL=deleteNonSubScriberUploadsInDatabase.js.map