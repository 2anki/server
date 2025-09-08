"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORT_EMAIL_ADDRESS = exports.CREATE_DECK_SCRIPT_PATH = exports.CREATE_DECK_DIR = exports.BUILD_DIR = exports.ONE_HOUR = exports.TIME_21_MINUTES_AS_SECONDS = exports.ALLOWED_ORIGINS = exports.TEMPLATE_DIR = void 0;
exports.resolvePath = resolvePath;
const path_1 = __importDefault(require("path"));
exports.TEMPLATE_DIR = path_1.default.join(__dirname, '../templates');
exports.ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:2020',
    'https://dev.notion2anki.alemayhu.com',
    'https://dev.2anki.net',
    'https://notion.2anki.com',
    'https://2anki.net',
    'https://2anki.com',
    'https://notion.2anki.net',
    'https://dev.notion.2anki.net',
    'https://notion.2anki.net/',
    'https://staging.2anki.net',
    'https://templates.2anki.net/',
    'https://app.2anki.net',
];
function resolvePath(dir, x) {
    const p = path_1.default
        .resolve(path_1.default.join(dir, x))
        .replace(/app.asar/g, 'app.asar.unpacked');
    return x.endsWith('/') ? `${p}/` : p;
}
exports.TIME_21_MINUTES_AS_SECONDS = 1260;
exports.ONE_HOUR = 60 * 60 * 1000;
exports.BUILD_DIR = process.env.WEB_BUILD_DIR || path_1.default.join(__dirname, '../../web/build');
exports.CREATE_DECK_DIR = process.env.CREATE_DECK_DIR || path_1.default.join(__dirname, '../../../create_deck/');
exports.CREATE_DECK_SCRIPT_PATH = path_1.default.join(exports.CREATE_DECK_DIR, 'create_deck.py');
exports.SUPPORT_EMAIL_ADDRESS = 'support@2anki.net';
//# sourceMappingURL=constants.js.map