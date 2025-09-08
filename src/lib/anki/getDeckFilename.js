"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getDeckFilename;
const Package_1 = __importDefault(require("../parser/Package"));
function isPackage(something) {
    return something instanceof Package_1.default;
}
function isString(something) {
    return typeof something === 'string';
}
function getDeckFilename(something) {
    let name = 'Default';
    if (isPackage(something)) {
        name = something.name;
    }
    else if (isString(something)) {
        name = something;
    }
    return name.endsWith('.apkg') ? name : `${name}.apkg`;
}
//# sourceMappingURL=getDeckFilename.js.map