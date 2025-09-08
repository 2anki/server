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
exports.default = getColumn;
function getColumn(parentId, handler, index) {
    return __awaiter(this, void 0, void 0, function* () {
        console.time('[NO_CACHE] - getColumn');
        const getBlocks = yield handler.api.getBlocks({
            createdAt: '',
            lastEditedAt: '',
            id: parentId,
            type: 'column_list',
        });
        const blocks = getBlocks === null || getBlocks === void 0 ? void 0 : getBlocks.results;
        if ((blocks === null || blocks === void 0 ? void 0 : blocks.length) > 0 && (blocks === null || blocks === void 0 ? void 0 : blocks.length) >= index + 1) {
            console.timeEnd('[NO_CACHE] - getColumn');
            return blocks[index];
        }
        console.timeEnd('[NO_CACHE] - getColumn');
        return null;
    });
}
//# sourceMappingURL=getColumn.js.map