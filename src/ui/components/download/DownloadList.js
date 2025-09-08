"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// No path import needed anymore
const react_1 = __importDefault(require("react"));
const DownloadList = ({ apkgFiles, id, styles, }) => {
    const showBulkDownload = apkgFiles.length > 0;
    const buttonHoverStyle = {
        backgroundColor: '#1d4ed8',
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showBulkDownload && ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '30px', textAlign: 'center' }, children: (0, jsx_runtime_1.jsxs)("a", { href: `/download/${id}/bulk`, style: Object.assign(Object.assign({}, styles.bulkDownloadButton), { textDecoration: 'none', display: 'inline-block', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }), role: "button", "aria-label": "Download all Anki decks", onMouseOver: (e) => {
                        Object.assign(e.currentTarget.style, buttonHoverStyle);
                    }, onFocus: (e) => {
                        Object.assign(e.currentTarget.style, buttonHoverStyle);
                    }, onMouseOut: (e) => {
                        e.currentTarget.style.backgroundColor = styles.bulkDownloadButton
                            .backgroundColor;
                    }, onBlur: (e) => {
                        e.currentTarget.style.backgroundColor = styles.bulkDownloadButton
                            .backgroundColor;
                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { marginRight: '8px' }, children: "\uD83D\uDCE6" }), " Download All Files"] }) })), (0, jsx_runtime_1.jsx)("ul", { style: styles.downloadList, children: apkgFiles.map((file) => ((0, jsx_runtime_1.jsxs)("li", { style: styles.downloadItem, children: [(0, jsx_runtime_1.jsxs)("span", { style: styles.downloadItemName, children: [(0, jsx_runtime_1.jsx)("span", { style: { marginRight: '10px', fontSize: '18px' }, children: "\uD83D\uDCC4" }), file] }), (0, jsx_runtime_1.jsx)("a", { href: `${id}/${file}`, style: Object.assign(Object.assign({}, styles.downloadItemLink), { textDecoration: 'none', display: 'inline-block', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }), role: "button", "aria-label": `Download ${file}`, onMouseOver: (e) => {
                                Object.assign(e.currentTarget.style, buttonHoverStyle);
                            }, onFocus: (e) => {
                                Object.assign(e.currentTarget.style, buttonHoverStyle);
                            }, onMouseOut: (e) => {
                                e.currentTarget.style.backgroundColor = styles.downloadItemLink
                                    .backgroundColor;
                            }, onBlur: (e) => {
                                e.currentTarget.style.backgroundColor = styles.downloadItemLink
                                    .backgroundColor;
                            }, children: "Download" })] }, file))) })] }));
};
exports.default = DownloadList;
//# sourceMappingURL=DownloadList.js.map