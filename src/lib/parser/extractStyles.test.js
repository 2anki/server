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
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const extractStyles_1 = require("./extractStyles");
describe('extractStyles', () => {
    it('should remove list-style-type changes', () => {
        const page = cheerio.load(`
 <style>.toggle {
\tpadding-inline-start: 0em;
\tlist-style-type: none;
}</style>
 `);
        const result = (0, extractStyles_1.extractStyles)(page);
        expect(result === null || result === void 0 ? void 0 : result.trim()).toEqual(`.toggle {
\tpadding-inline-start: 0em;
\t
}`.trim());
    });
    it('should remove white-space: pre-wrap', () => {
        const page = cheerio.load(`
  <style>.toggle {
\tpadding-inline-start: 0em;
\twhite-space: pre-wrap;
}</style>`);
        const result = (0, extractStyles_1.extractStyles)(page);
        expect(result === null || result === void 0 ? void 0 : result.trim()).toEqual(`.toggle {
\tpadding-inline-start: 0em;
\t
}`.trim());
    });
});
//# sourceMappingURL=extractStyles.test.js.map