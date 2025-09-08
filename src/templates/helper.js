"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTION_STYLE = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.NOTION_STYLE = fs_1.default.readFileSync(path_1.default.join(__dirname, './notion.css'), 'utf8');
//# sourceMappingURL=helper.js.map