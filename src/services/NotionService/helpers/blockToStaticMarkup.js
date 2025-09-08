"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockToStaticMarkup = void 0;
const BlockCallout_1 = require("../blocks/BlockCallout");
const BlockChildPage_1 = require("../blocks/BlockChildPage");
const BlockCode_1 = __importDefault(require("../blocks/BlockCode"));
const BlockDivider_1 = require("../blocks/BlockDivider");
const BlockEquation_1 = __importDefault(require("../blocks/BlockEquation"));
const BlockHeadings_1 = require("../blocks/BlockHeadings");
const BlockParagraph_1 = __importDefault(require("../blocks/BlockParagraph"));
const BlockQuote_1 = require("../blocks/BlockQuote");
const LinkToPage_1 = __importDefault(require("../blocks/LinkToPage/LinkToPage"));
const BlockBulletList_1 = require("../blocks/lists/BlockBulletList");
const BlockColumnList_1 = __importDefault(require("../blocks/lists/BlockColumnList"));
const BlockNumberedList_1 = require("../blocks/lists/BlockNumberedList");
const BlockTodoList_1 = require("../blocks/lists/BlockTodoList");
const BlockToggleList_1 = require("../blocks/lists/BlockToggleList");
const BlockBookmark_1 = __importDefault(require("../blocks/media/BlockBookmark"));
const BlockEmbed_1 = require("../blocks/media/BlockEmbed");
const BlockVideo_1 = require("../blocks/media/BlockVideo");
const blockToStaticMarkup = (handler, c, response) => __awaiter(void 0, void 0, void 0, function* () {
    let back = '';
    switch (c.type) {
        case 'image':
            const image = yield handler.embedImage(c);
            back += image;
            break;
        case 'audio':
            const audio = yield handler.embedAudioFile(c);
            back += audio;
            break;
        case 'file':
            const file = yield handler.embedFile(c);
            back += file;
            break;
        case 'paragraph':
            back += yield (0, BlockParagraph_1.default)(c, handler);
            break;
        case 'code':
            back += (0, BlockCode_1.default)(c, handler);
            break;
        case 'heading_1':
            back += yield (0, BlockHeadings_1.BlockHeading)('heading_1', c, handler);
            break;
        case 'heading_2':
            back += yield (0, BlockHeadings_1.BlockHeading)('heading_2', c, handler);
            break;
        case 'heading_3':
            back += yield (0, BlockHeadings_1.BlockHeading)('heading_3', c, handler);
            break;
        case 'quote':
            back += (0, BlockQuote_1.BlockQuote)(c, handler);
            break;
        case 'divider':
            back += (0, BlockDivider_1.BlockDivider)();
            break;
        case 'child_page':
            back += yield (0, BlockChildPage_1.BlockChildPage)(c, handler);
            break;
        case 'to_do':
            back += yield (0, BlockTodoList_1.BlockTodoList)(c, response, handler);
            break;
        case 'callout':
            back += (0, BlockCallout_1.BlockCallout)(c, handler);
            break;
        case 'bulleted_list_item':
            back += yield (0, BlockBulletList_1.BlockBulletList)(c, response, handler);
            break;
        case 'numbered_list_item':
            back += yield (0, BlockNumberedList_1.BlockNumberedList)(c, response, handler);
            break;
        case 'toggle':
            back += yield (0, BlockToggleList_1.BlockToggleList)(c, handler);
            break;
        case 'bookmark':
            back += yield (0, BlockBookmark_1.default)(c, handler);
            break;
        case 'video':
            back += (0, BlockVideo_1.BlockVideo)(c, handler);
            break;
        case 'embed':
            back += (0, BlockEmbed_1.BlockEmbed)(c, handler);
            break;
        case 'column_list':
            back += yield (0, BlockColumnList_1.default)(c, handler);
            break;
        case 'equation':
            back += (0, BlockEquation_1.default)(c);
            break;
        case 'link_to_page':
            back += yield (0, LinkToPage_1.default)(c, handler);
            break;
        default:
            back += `unsupported: ${c.type}`;
            back += (0, BlockDivider_1.BlockDivider)();
            back += `
          <pre>
          ${JSON.stringify(c, null, 4)}
          </pre>`;
            console.debug(`unsupported ${c.type}`);
    }
    return back;
});
exports.blockToStaticMarkup = blockToStaticMarkup;
//# sourceMappingURL=blockToStaticMarkup.js.map