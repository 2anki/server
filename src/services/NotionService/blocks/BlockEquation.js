"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlockEquation;
function BlockEquation(block) {
    const { equation } = block;
    const { expression } = equation;
    return `\\(${expression}\\)`;
}
//# sourceMappingURL=BlockEquation.js.map