"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioUrl = void 0;
const client_1 = require("@notionhq/client");
const getAudioUrl = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return null;
    }
    switch (block.audio.type) {
        case 'external':
            return block.audio.external.url;
        case 'file':
            return block.audio.file.url;
        default:
            return 'unsupported audio: ' + JSON.stringify(block);
    }
};
exports.getAudioUrl = getAudioUrl;
//# sourceMappingURL=getAudioUrl.js.map