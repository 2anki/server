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
exports.default = LinkToPage;
const renderLink_1 = __importDefault(require("../../helpers/renderLink"));
const getBlockIcon_1 = __importDefault(require("../getBlockIcon"));
function LinkToPage(block, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        const linkToPage = block.link_to_page.type === 'page_id'
            ? block.link_to_page.page_id
            : undefined;
        if (!linkToPage) {
            return `Unsupported link ${JSON.stringify(block)}`;
        }
        const page = yield handler.api.getPage(linkToPage);
        const title = yield handler.api.getPageTitle(page, handler.settings);
        return (0, renderLink_1.default)(title, block, (0, getBlockIcon_1.default)(page));
    });
}
//# sourceMappingURL=LinkToPage.js.map