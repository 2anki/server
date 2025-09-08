"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTION_COLORS = void 0;
exports.default = notionColorToHex;
exports.isNotionColorBackground = isNotionColorBackground;
exports.styleWithColors = styleWithColors;
exports.NOTION_COLORS = [
    { name: 'default', color: '#37352F' },
    { name: 'gray', color: '#9B9A97' },
    { name: 'brown', color: '#64473A' },
    { name: 'orange', color: '#D9730D' },
    { name: 'yellow', color: '#DFAB01' },
    { name: 'green', color: '#0F7B6C' },
    { name: 'blue', color: '#0B6E99' },
    { name: 'purple', color: '#6940A5' },
    { name: 'pink', color: '#AD1A72' },
    { name: 'red', color: '#E03E3E' },
    { name: 'gray_background', color: '#9B9A97' },
    { name: 'brown_background', color: '#64473A' },
    { name: 'orange_background', color: '#D9730D' },
    { name: 'yellow_background', color: '#DFAB01' },
    { name: 'green_background', color: '#0F7B6C' },
    { name: 'blue_background', color: '#0B6E99' },
    { name: 'purple_background', color: '#E03E3E' },
    { name: 'pink_background', color: '#AD1A72' },
    { name: 'red_background', color: '#E03E3E' },
];
function notionColorToHex(color) {
    var _a;
    const match = exports.NOTION_COLORS.find((c) => c.name === color);
    return (_a = match === null || match === void 0 ? void 0 : match.color) !== null && _a !== void 0 ? _a : exports.NOTION_COLORS[0].color;
}
function isNotionColorBackground(color) {
    return color.endsWith('_background');
}
function styleWithColors(color) {
    if (!color || color === 'default') {
        return '';
    }
    return ` n2a-highlight-${color}`;
}
//# sourceMappingURL=NotionColors.js.map