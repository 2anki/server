"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadFooter = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const DownloadFooter = ({ styles = {}, }) => {
    const { footer = {}, footerLink = {} } = styles;
    return ((0, jsx_runtime_1.jsxs)("div", { style: footer, children: [(0, jsx_runtime_1.jsxs)("p", { children: ["These files will be automatically deleted after 24 hours.", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("a", { href: "https://2anki.net", style: footerLink, target: "_blank", rel: "noopener noreferrer", "aria-label": "Return to 2anki.net (opens in new tab)", children: "Return to 2anki.net" }), ' ', "|", (0, jsx_runtime_1.jsx)("a", { href: "https://docs.2anki.net", style: footerLink, target: "_blank", rel: "noopener noreferrer", "aria-label": "Documentation (opens in new tab)", children: "Documentation" }), ' ', "|", (0, jsx_runtime_1.jsx)("a", { href: "https://github.com/2anki/2anki.net", style: footerLink, target: "_blank", rel: "noopener noreferrer", "aria-label": "GitHub repository (opens in new tab)", children: "GitHub" })] }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: '12px', marginTop: '10px' }, children: ["\u00A9 ", new Date().getFullYear(), " 2anki.net - Convert your notes to Anki flashcards"] })] }));
};
exports.DownloadFooter = DownloadFooter;
//# sourceMappingURL=DownloadFooter.js.map