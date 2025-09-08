"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDetailsTagToNotionToggleList = transformDetailsTagToNotionToggleList;
function transformDetailsTagToNotionToggleList(dom, details) {
    return details.map((detail) => {
        const wrapper = dom('<ul class="toggle"><li></li></ul>');
        wrapper.find('li').append(dom(detail));
        return wrapper[0];
    });
}
//# sourceMappingURL=transformDetailsTagToNotionToggleList.js.map