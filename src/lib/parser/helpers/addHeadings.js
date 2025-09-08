"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addHeadings;
const headings = ['heading_1', 'heading_2', 'heading_3'];
function addHeadings(input) {
    const hasHeading = input.some((item) => item.startsWith('heading'));
    if (!hasHeading) {
        return input;
    }
    return input.filter((item) => !item.startsWith('heading')).concat(headings);
}
//# sourceMappingURL=addHeadings.js.map