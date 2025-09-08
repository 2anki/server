"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockHeading = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const TagRegistry_1 = __importDefault(require("../../../lib/parser/TagRegistry"));
const getPlainText_1 = __importDefault(require("../helpers/getPlainText"));
const HandleBlockAnnotations_1 = __importDefault(require("./HandleBlockAnnotations"));
const getHeadingText_1 = require("../helpers/getHeadingText");
const getHeadingColor_1 = require("../helpers/getHeadingColor");
const NotionColors_1 = require("../NotionColors");
const Heading = (props) => {
    const { id, level, children, className } = props;
    switch (level) {
        case 'heading_3':
            return ((0, jsx_runtime_1.jsx)("h3", { id: id, className: className, children: children }));
        case 'heading_2':
            return ((0, jsx_runtime_1.jsx)("h2", { id: id, className: className, children: children }));
        default:
            return ((0, jsx_runtime_1.jsx)("h1", { id: id, className: className, children: children }));
    }
};
const BlockHeading = (level, block, handler) => {
    var _a;
    const headingText = (0, getHeadingText_1.getHeadingText)(block);
    if (!headingText) {
        return null;
    }
    if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
        return (0, getPlainText_1.default)(headingText);
    }
    return server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)(Heading, { level: level, className: (0, NotionColors_1.styleWithColors)((0, getHeadingColor_1.getHeadingColor)(block)), id: block.id, children: headingText.map((t) => {
            TagRegistry_1.default.getInstance().addHeading(t.plain_text);
            const { annotations } = t;
            return (0, HandleBlockAnnotations_1.default)(annotations, t);
        }) }));
};
exports.BlockHeading = BlockHeading;
//# sourceMappingURL=BlockHeadings.js.map