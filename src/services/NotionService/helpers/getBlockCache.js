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
exports.getBlockCache = getBlockCache;
function getBlockCache(_a) {
    return __awaiter(this, arguments, void 0, function* ({ database, id, owner, lastEditedAt, }) {
        const cache = yield database('blocks')
            .where({ object_id: id, owner })
            .first();
        // We did not find a cache entry or the user has made changes
        if (!cache || new Date(lastEditedAt) > new Date(cache.last_edited_time)) {
            return undefined;
        }
        // Found cache and update the fetch request (used for performance analysis)
        database('blocks')
            .where({ object_id: id })
            .update({
            fetch: cache.fetch + 1,
        });
        return cache.payload;
    });
}
//# sourceMappingURL=getBlockCache.js.map