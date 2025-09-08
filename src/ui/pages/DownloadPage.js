"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const DownloadTitle_1 = require("../components/download/DownloadTitle");
const DownloadDescription_1 = __importDefault(require("../components/download/DownloadDescription"));
const DownloadList_1 = __importDefault(require("../components/download/DownloadList"));
const DownloadFooter_1 = require("../components/download/DownloadFooter");
const styles_1 = require("../components/download/styles");
const DownloadPage = ({ id, files }) => {
    const apkgFiles = files.filter((file) => file.endsWith('.apkg'));
    const hasFiles = apkgFiles.length > 0;
    return server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsxs)("html", { children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("title", { children: hasFiles
                            ? '✅ Your Anki Decks Are Ready!'
                            : '❌ No Anki Decks Available' }), (0, jsx_runtime_1.jsx)("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), (0, jsx_runtime_1.jsx)("meta", { name: "description", content: "Download your Anki decks from 2anki.net" }), (0, jsx_runtime_1.jsx)("style", { dangerouslySetInnerHTML: {
                            __html: `
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          }
          * { box-sizing: border-box; }
          a:hover { text-decoration: underline; }
        `,
                        } })] }), (0, jsx_runtime_1.jsx)("body", { children: (0, jsx_runtime_1.jsxs)("div", { style: styles_1.styles.downloadContainer, children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsx)("h1", { style: styles_1.styles.downloadHeader, children: (0, jsx_runtime_1.jsx)(DownloadTitle_1.DownloadTitle, { hasFiles: hasFiles }) }), (0, jsx_runtime_1.jsx)(DownloadDescription_1.default, { hasFiles: hasFiles, styles: {
                                        pageDescription: styles_1.styles.pageDescription,
                                        footerLink: styles_1.styles.footerLink,
                                    } })] }), (0, jsx_runtime_1.jsx)("main", { children: (0, jsx_runtime_1.jsx)(DownloadList_1.default, { apkgFiles: apkgFiles, id: id, styles: styles_1.styles }) }), hasFiles && ((0, jsx_runtime_1.jsx)(DownloadFooter_1.DownloadFooter, { styles: { footer: styles_1.styles.footer, footerLink: styles_1.styles.footerLink } }))] }) })] }));
};
exports.DownloadPage = DownloadPage;
//# sourceMappingURL=DownloadPage.js.map