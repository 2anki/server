"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISABLE_EMOJI = void 0;
exports.default = getBlockIcon;
exports.DISABLE_EMOJI = 'disable_emoji';
function getBlockIcon(p, emoji) {
    var _a;
    switch ((_a = p === null || p === void 0 ? void 0 : p.icon) === null || _a === void 0 ? void 0 : _a.type) {
        case 'emoji':
            if (emoji === exports.DISABLE_EMOJI) {
                return '';
            }
            return p.icon.emoji;
        case 'external':
            return p.icon.external.url;
        case 'file':
            return p.icon.file.url;
        default:
            return '';
    }
}
//# sourceMappingURL=getBlockIcon.js.map