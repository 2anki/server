"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleClozeDeletions;
const cheerio = __importStar(require("cheerio"));
const replaceAll_1 = __importDefault(require("./replaceAll"));
// Helper functions first
function findHighestClozeNumber(input) {
    const clozeRegex = /c(\d+)::/g;
    const numbers = Array.from(input.matchAll(clozeRegex)).map((match) => parseInt(match[1]));
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}
function handleKatexCloze(content, num, isStandalone) {
    const vReplaced = content.replace('KaTex:', '');
    return isStandalone
        ? `{{c${num}::${vReplaced} }}`
        : `{{c${num}::${vReplaced}}}`;
}
function handleRegularCloze(content, num) {
    return content.match(/c\d::/) ? `{{${content}}}` : `{{c${num}::${content}}}`;
}
function handleClozeDeletions(input) {
    let num = findHighestClozeNumber(input);
    const dom = cheerio.load(input);
    const clozeDeletions = dom('code');
    let mangle = input;
    clozeDeletions.each((_i, elem) => {
        const v = dom(elem).html();
        if (!v)
            return;
        const old = `<code>${v}</code>`;
        if (v.includes('KaTex')) {
            const isStandalone = (mangle.match(/<code>/g) || []).length === 1;
            mangle = (0, replaceAll_1.default)(mangle, old, handleKatexCloze(v, num++, isStandalone));
            return;
        }
        if (v.includes('{{c') && v.includes('}}')) {
            mangle = (0, replaceAll_1.default)(mangle, old, v);
            return;
        }
        if (v.match(/c\d::/)) {
            mangle = mangle.replace('<code>', v.includes('{{') ? '' : '{{');
            mangle = mangle.replace('</code>', v.endsWith('}}') ? '' : '}}');
            return;
        }
        mangle = (0, replaceAll_1.default)(mangle, old, handleRegularCloze(v, num++));
    });
    return mangle;
}
//# sourceMappingURL=handleClozeDeletions.js.map