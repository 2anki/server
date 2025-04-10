"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockVideo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
const getVideoUrl_1 = require("./helpers/getVideoUrl");
const isVimeoLink_1 = require("./helpers/isVimeoLink");
const BlockVideo = (c, handler) => {
    var _a;
    let url = (0, getVideoUrl_1.getVideoUrl)(c);
    if (((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) || !url) {
        return null;
    }
    if ((0, isVimeoLink_1.isVimeoLink)(url)) {
        return url;
    }
    return (0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("iframe", { width: "560", height: "315", src: url, frameBorder: "0", allowFullScreen: true }) }));
};
exports.BlockVideo = BlockVideo;
//# sourceMappingURL=BlockVideo.js.map