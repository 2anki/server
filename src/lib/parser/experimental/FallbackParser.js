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
const cheerio = __importStar(require("cheerio"));
const checks_1 = require("../../storage/checks");
const Deck_1 = __importDefault(require("../Deck"));
const Note_1 = __importDefault(require("../Note"));
const PlainTextParser_1 = require("./PlainTextParser/PlainTextParser");
const types_1 = require("./PlainTextParser/types");
const get16DigitRandomId_1 = __importDefault(require("../../../shared/helpers/get16DigitRandomId"));
const csv_to_apkg_1 = require("@2anki/csv-to-apkg");
class FallbackParser {
    constructor(files) {
        this.files = files;
    }
    htmlToTextWithNewlines(html) {
        if (typeof html !== 'string' || !html.trim()) {
            console.warn('[FallbackParser] htmlToTextWithNewlines called with invalid html:', html);
            return [];
        }
        const $ = cheerio.load(html);
        function processListItems(items) {
            let result = '';
            items.each((_, element) => {
                const itemText = $(element).text().trim();
                result += `• ${itemText}\n`;
            });
            return result;
        }
        const elem = $('ul, ol');
        let items = [];
        elem.each((_, element) => {
            const listItems = $(element).find('li');
            const listText = processListItems(listItems);
            items.push(listText);
        });
        return items;
    }
    getTitleFromHTML(html) {
        const $ = cheerio.load(html);
        return $('title').text().trim();
    }
    getStyleTagFromString(html) {
        var _a;
        const $ = cheerio.load(html);
        const styleTag = $('style');
        if (styleTag.length === 0) {
            return ''; // No style tag found, return an empty string
        }
        return (_a = styleTag.text()) !== null && _a !== void 0 ? _a : '';
    }
    /**
     * Extract bullet points from markdown content
     *
     * Matches lines starting with -, *, or + followed by one or more spaces or tabs,
     * and then any characters. This handles standard Markdown bullet point formats
     * as well as cloze deletion formats with backticks and equals separator.
     *
     * @param markdown markdown content
     * @returns array of bullet points or null if no bullet points found
     */
    getMarkdownBulletLists(markdown) {
        const bulletListRegex = /[-*+][ \t]+.*/g;
        return markdown.match(bulletListRegex);
    }
    /**
     * Return the correct title from markdown
     *
     * Notion can have two titles in Markdown files.
     * The first one is the title with a the id of the page.
     * The second one is the title of the page only.
     *
     * @param markdown user input markdown
     * @returns deck title
     */
    getTitleMarkdown(markdown) {
        const headingRegex = /^(#{1,6})\s+(.*)$/gm;
        const matches = [...markdown.matchAll(headingRegex)];
        if (matches.length >= 2) {
            return matches[1][2]; // return second match
        }
        else if (matches.length > 0) {
            return matches[0][2];
        }
        return 'Default';
    }
    mapCardsToNotes(cards) {
        return cards.filter(Boolean).map((card, index) => {
            const note = new Note_1.default(card.front, '');
            note.number = index;
            if ((0, types_1.isClozeFlashcard)(card)) {
                note.cloze = true;
            }
            else {
                note.back = card.back;
                if (!note.back || note.back.trim().length === 0) {
                    const parts = note.name.split('\n');
                    if (parts.length > 1) {
                        note.name = parts[0];
                        note.back = parts.slice(1).join('\n');
                    }
                }
            }
            return note;
        });
    }
    run(settings) {
        var _a, _b, _c;
        const decks = [];
        let clean = true;
        for (const file of this.files) {
            const contents = (_a = file.contents) === null || _a === void 0 ? void 0 : _a.toString();
            if (!contents) {
                continue;
            }
            let cards = [];
            let deckName = 'Untitled';
            if ((0, checks_1.isHTMLFile)(file.name)) {
                const plainText = this.htmlToTextWithNewlines(contents).join('\n');
                const plainTextParser = new PlainTextParser_1.PlainTextParser();
                const found = plainTextParser.parse(plainText);
                cards = this.mapCardsToNotes(found);
                deckName = (_b = this.getTitleFromHTML(contents)) !== null && _b !== void 0 ? _b : file.name;
            }
            else if ((0, checks_1.isMarkdownFile)(file.name) || (0, checks_1.isPlainText)(file.name)) {
                const plainTextParser = new PlainTextParser_1.PlainTextParser();
                const items = this.getMarkdownBulletLists(contents);
                if (!items) {
                    continue;
                }
                const found = plainTextParser.parse(items.join('\n'));
                cards = this.mapCardsToNotes(found);
                deckName = this.getTitleMarkdown(contents);
            }
            else if ((0, checks_1.isCSVFile)(file.name)) {
                const csv = new TextDecoder().decode(file.contents);
                deckName = (_c = file.name) !== null && _c !== void 0 ? _c : 'Default';
                cards = (0, csv_to_apkg_1.getCardsFromCSV)(csv);
                clean = false;
            }
            if (cards.length > 0) {
                decks.push(new Deck_1.default(deckName, clean ? Deck_1.default.CleanCards(cards) : cards, // Do not clean csv files
                '', // skip cover image
                '', // skip style
                (0, get16DigitRandomId_1.default)(), settings));
            }
        }
        return decks;
    }
}
exports.default = FallbackParser;
//# sourceMappingURL=FallbackParser.js.map