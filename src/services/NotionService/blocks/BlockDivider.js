"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockDivider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const BlockDivider = () => server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)("hr", {}));
exports.BlockDivider = BlockDivider;
//# sourceMappingURL=BlockDivider.js.map