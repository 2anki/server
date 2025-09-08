"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNotionToggleLists = findNotionToggleLists;
function findNotionToggleLists(dom, context) {
    if (context.isCherry || context.isAll) {
        return dom('.toggle').toArray();
    }
    if (!context.disableIndentedBulletPoints) {
        return dom('.page-body > ul').toArray();
    }
    return dom('.page-body > ul:not(.bulleted-list)').toArray();
}
//# sourceMappingURL=findNotionToggleLists.js.map