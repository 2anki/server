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
exports.renderBack = void 0;
const client_1 = require("@notionhq/client");
const blockToStaticMarkup_1 = require("./blockToStaticMarkup");
const renderBack = (handler, requestChildren, response, handleChildren) => __awaiter(void 0, void 0, void 0, function* () {
    let back = '';
    for (const c of requestChildren) {
        // If the block has been handled before, skip it.
        // This can be true due to nesting
        if (handler.skip.includes(c.id)) {
            continue;
        }
        if (!(0, client_1.isFullBlock)(c)) {
            continue;
        }
        back += yield (0, blockToStaticMarkup_1.blockToStaticMarkup)(handler, c, response);
        // Nesting applies to all not just toggles
        if (handleChildren ||
            (c.has_children && c.type !== 'toggle' && c.type !== 'bulleted_list_item')) {
            back += yield handler.getBackSide(c);
        }
    }
    return back;
});
exports.renderBack = renderBack;
//# sourceMappingURL=renderBack.js.map