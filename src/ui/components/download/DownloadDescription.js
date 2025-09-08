"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const DownloadMessage = ({ hasFiles, styles = {}, }) => {
    const { pageDescription = {}, footerLink = {} } = styles;
    return ((0, jsx_runtime_1.jsx)("p", { style: pageDescription, children: hasFiles ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 500 }, children: "Success!" }), " Here are the Anki decks created from your upload. Click on individual deck names to download them, or use the \"Download All Files\" button to get everything at once."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["No Anki decks were found in your upload. Please check that your content follows the", ' ', (0, jsx_runtime_1.jsx)("a", { href: "https://docs.2anki.net/", style: footerLink, target: "_blank", rel: "noopener noreferrer", "aria-label": "2anki.net formatting guidelines (opens in new tab)", children: "2anki.net formatting guidelines" }), ' ', "for creating valid flashcards."] })) }));
};
exports.default = DownloadMessage;
//# sourceMappingURL=DownloadDescription.js.map