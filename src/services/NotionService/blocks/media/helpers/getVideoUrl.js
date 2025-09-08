"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoUrl = exports.getVimeoVideoId = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@notionhq/client");
const getYouTubeID_1 = __importDefault(require("../../../../../lib/parser/helpers/getYouTubeID"));
const getYouTubeEmbedLink_1 = __importDefault(require("../../../../../lib/parser/helpers/getYouTubeEmbedLink"));
const isVimeoLink_1 = require("./isVimeoLink");
const server_1 = require("react-dom/server");
const getVimeoVideoId = (vimeoUrl) => {
    const parts = vimeoUrl.split('/').pop();
    if (!parts) {
        return null;
    }
    return parts.split('?')[0];
};
exports.getVimeoVideoId = getVimeoVideoId;
const getVideoUrl = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return null;
    }
    switch (block.video.type) {
        case 'external':
            const url = block.video.external.url;
            const yt = (0, getYouTubeID_1.default)(url);
            if (yt) {
                return (0, getYouTubeEmbedLink_1.default)(yt);
            }
            else if ((0, isVimeoLink_1.isVimeoLink)(url)) {
                const vimeoUrl = url.replace('vimeo.com/', 'player.vimeo.com/video/');
                if (vimeoUrl) {
                    const videoId = (0, exports.getVimeoVideoId)(vimeoUrl);
                    return (0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)("iframe", { title: "vimeo-player", src: `https://player.vimeo.com/video/${videoId}`, width: "640", height: "368", frameBorder: "0", allowFullScreen: true }));
                }
            }
            return block.video.external.url;
        case 'file':
            return block.video.file.url;
        default:
            return 'unsupported video: ' + JSON.stringify(block);
    }
};
exports.getVideoUrl = getVideoUrl;
//# sourceMappingURL=getVideoUrl.js.map