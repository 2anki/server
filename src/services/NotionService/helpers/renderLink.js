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
exports.default = renderLink;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const renderIcon_1 = __importDefault(require("./renderIcon"));
function renderLink(title, block, icon) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = yield (0, renderIcon_1.default)(icon);
        return server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsxs)("a", { id: block.id, href: `https://notion.so/${block.id.replace(/-/g, '')}`, children: [r, title] }));
    });
}
//# sourceMappingURL=renderLink.js.map