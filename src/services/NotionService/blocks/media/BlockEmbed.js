"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockEmbed = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
const getYouTubeEmbedLink_1 = __importDefault(require("../../../../lib/parser/helpers/getYouTubeEmbedLink"));
const getYouTubeID_1 = __importDefault(require("../../../../lib/parser/helpers/getYouTubeID"));
const checks_1 = require("../../../../lib/storage/checks");
const BlockEmbed = (c, handler) => {
    var _a;
    if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
        return '';
    }
    const { embed } = c;
    let { url } = embed;
    if (url) {
        if ((0, checks_1.isSoundCloudURL)(url)) {
            url = `https://w.soundcloud.com/player/?url=${url}`;
        }
        else if ((0, checks_1.isTwitterURL)(url)) {
            return (0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)("div", { className: "source", children: (0, jsx_runtime_1.jsx)("a", { href: url, children: url }) }));
        }
        const yt = (0, getYouTubeID_1.default)(url);
        if (yt) {
            url = (0, getYouTubeEmbedLink_1.default)(yt);
        }
    }
    return (0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("iframe", { width: "560", height: "315", src: url, frameBorder: "0", allowFullScreen: true }) }));
};
exports.BlockEmbed = BlockEmbed;
//# sourceMappingURL=BlockEmbed.js.map