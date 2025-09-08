"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getYouTubeID;
function getYouTubeID(input) {
    const m = input.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/);
    if (!m || m.length === 0) {
        return null;
    }
    // prevent swallowing of soundcloud embeds
    if (m[0].match(/https:\/\/soundcloud.com/)) {
        return null;
    }
    return m[1];
}
//# sourceMappingURL=getYouTubeID.js.map