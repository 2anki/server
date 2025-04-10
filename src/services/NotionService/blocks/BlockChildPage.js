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
exports.BlockChildPage = void 0;
const getBlockIcon_1 = __importDefault(require("./getBlockIcon"));
const renderLink_1 = __importDefault(require("../helpers/renderLink"));
const BlockChildPage = (block, handler) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const childPage = block.child_page;
    const { api } = handler;
    const page = yield api.getPage(block.id);
    const icon = (0, getBlockIcon_1.default)(page);
    if (((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) && childPage) {
        return childPage.title;
    }
    return (0, renderLink_1.default)(childPage.title, block, icon);
});
exports.BlockChildPage = BlockChildPage;
//# sourceMappingURL=BlockChildPage.js.map