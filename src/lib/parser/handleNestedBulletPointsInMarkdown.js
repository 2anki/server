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
exports.handleNestedBulletPointsInMarkdown = void 0;
const Deck_1 = __importDefault(require("./Deck"));
const getTitleFromMarkdown_1 = require("./getTitleFromMarkdown");
const get16DigitRandomId_1 = __importDefault(require("../../shared/helpers/get16DigitRandomId"));
const Note_1 = __importDefault(require("./Note"));
const markdown_1 = require("../markdown");
const cheerio = __importStar(require("cheerio"));
const embedFile_1 = require("./exporters/embedFile");
const checks_1 = require("../storage/checks");
const BULLET_POINT_REGEX = /^-/;
const handleNestedBulletPointsInMarkdown = (input) => {
    var _a, _b;
    const { name, contents, deckName, decks, settings, exporter, workspace, files, } = input;
    const deck = new Deck_1.default((_a = deckName !== null && deckName !== void 0 ? deckName : (0, getTitleFromMarkdown_1.getTitleFromMarkdown)(contents)) !== null && _a !== void 0 ? _a : name, [], '', '', (0, get16DigitRandomId_1.default)(), settings);
    decks.push(deck);
    // Parse the markdown content
    const lines = (_b = contents === null || contents === void 0 ? void 0 : contents.split('\n')) !== null && _b !== void 0 ? _b : [];
    let isCreating = false;
    let currentFront = '';
    let currentBack = '';
    const trimWhitespace = true;
    for (const line of lines) {
        if (line.trim().length === 0) {
            continue;
        }
        if (BULLET_POINT_REGEX.exec(line) && isCreating) {
            const dom = cheerio.load(currentBack, {
                xmlMode: true,
            });
            const images = dom('img');
            const media = [];
            images.each((_i, elem) => {
                const src = dom(elem).attr('src');
                if (src && (0, checks_1.isImageFileEmbedable)(src)) {
                    const newName = (0, embedFile_1.embedFile)({
                        exporter: exporter,
                        files: files,
                        filePath: src,
                        workspace: workspace,
                    });
                    if (newName) {
                        dom(elem).attr('src', newName);
                        media.push(newName);
                    }
                }
            });
            currentBack = dom.html() || '';
            const note = new Note_1.default(currentFront, (0, markdown_1.markdownToHTML)(currentBack, trimWhitespace));
            note.media = media;
            deck.cards.push(note);
            isCreating = false;
            currentFront = '';
            currentBack = '';
        }
        if (BULLET_POINT_REGEX.exec(line) && !isCreating) {
            isCreating = true;
            currentFront = (0, markdown_1.markdownToHTML)(line, trimWhitespace);
            currentBack = '';
        }
        else if (isCreating) {
            currentBack += line + '\n';
        }
    }
    // Ensure the last card is processed
    if (currentBack !== '' || currentFront !== '') {
        const dom = cheerio.load(currentBack, {
            xmlMode: true,
        });
        const images = dom('img');
        const media = [];
        images.each((_i, elem) => {
            const src = dom(elem).attr('src');
            if (src && (0, checks_1.isImageFileEmbedable)(src)) {
                const newName = (0, embedFile_1.embedFile)({
                    exporter,
                    files: files,
                    filePath: src,
                    workspace,
                });
                if (newName) {
                    dom(elem).attr('src', newName);
                    media.push(newName);
                }
            }
        });
        currentBack = dom.html() || '';
        const note = new Note_1.default(currentFront, (0, markdown_1.markdownToHTML)(currentBack, trimWhitespace));
        note.media = media;
        deck.cards.push(note);
    }
    return decks;
};
exports.handleNestedBulletPointsInMarkdown = handleNestedBulletPointsInMarkdown;
//# sourceMappingURL=handleNestedBulletPointsInMarkdown.js.map