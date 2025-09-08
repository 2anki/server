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
exports.default = renderIcon;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
const axios_1 = __importDefault(require("axios"));
function renderIcon(icon) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!icon) {
            return null;
        }
        if (icon.startsWith('http')) {
            let validIcon = true;
            yield axios_1.default.get(icon).catch(function (error) {
                if (error.response && error.response.status === 404) {
                    validIcon = false;
                }
            });
            if (!validIcon) {
                return null;
            }
            return (0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)("img", { src: icon, width: "32" }));
        }
        return (0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)("span", { className: "icon", children: icon }));
    });
}
//# sourceMappingURL=renderIcon.js.map