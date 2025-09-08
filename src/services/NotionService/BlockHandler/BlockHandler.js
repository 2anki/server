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
const client_1 = require("@notionhq/client");
const axios_1 = __importDefault(require("axios"));
const getDeckname_1 = __importDefault(require("../../../lib/anki/getDeckname"));
const sanitizeTags_1 = __importDefault(require("../../../lib/anki/sanitizeTags"));
const file_1 = require("../../../lib/misc/file");
const getUniqueFileName_1 = __importDefault(require("../../../lib/misc/getUniqueFileName"));
const Deck_1 = __importDefault(require("../../../lib/parser/Deck"));
const Note_1 = __importDefault(require("../../../lib/parser/Note"));
const TagRegistry_1 = __importDefault(require("../../../lib/parser/TagRegistry"));
const get16DigitRandomId_1 = __importDefault(require("../../../shared/helpers/get16DigitRandomId"));
const helper_1 = require("../../../templates/helper");
const BlockColumn_1 = __importDefault(require("../blocks/lists/BlockColumn"));
const blockToStaticMarkup_1 = require("../helpers/blockToStaticMarkup");
const getAudioUrl_1 = require("../helpers/getAudioUrl");
const getClozeDeletionCard_1 = __importDefault(require("../helpers/getClozeDeletionCard"));
const getColumn_1 = __importDefault(require("../helpers/getColumn"));
const getFileUrl_1 = require("../helpers/getFileUrl");
const getImageUrl_1 = require("../helpers/getImageUrl");
const getInputCard_1 = __importDefault(require("../helpers/getInputCard"));
const isColumnList_1 = __importDefault(require("../helpers/isColumnList"));
const isTesting_1 = __importDefault(require("../helpers/isTesting"));
const preserveNewlinesIfApplicable_1 = __importDefault(require("../helpers/preserveNewlinesIfApplicable"));
const renderBack_1 = require("../helpers/renderBack");
const deckNameToText_1 = require("./helpers/deckNameToText");
const getSubDeckName_1 = __importDefault(require("./helpers/getSubDeckName"));
const RenderNotionLink_1 = __importDefault(require("./RenderNotionLink"));
class BlockHandler {
    constructor(exporter, api, settings) {
        this.useAll = false;
        this.exporter = exporter;
        this.api = api;
        this.skip = [];
        this.settings = settings;
    }
    embedImage(c) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = (0, getImageUrl_1.getImageUrl)(c);
            if (this.settings.isTextOnlyBack || (0, isTesting_1.default)() || !url) {
                return '';
            }
            // If disable-embedding-images is enabled, return image tag with remote URL
            if (this.settings.disableEmbeddingImages) {
                return `<img src="${url}" />`;
            }
            const suffix = (0, file_1.SuffixFrom)((0, file_1.S3FileName)(url));
            const newName = (0, getUniqueFileName_1.default)(url) + (suffix !== null && suffix !== void 0 ? suffix : '');
            const imageRequest = yield axios_1.default.get(url, {
                responseType: 'arraybuffer',
            });
            const contents = imageRequest.data;
            this.exporter.addMedia(newName, contents);
            return `<img src="${newName}" />`;
        });
    }
    embedAudioFile(c) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = (0, getAudioUrl_1.getAudioUrl)(c);
            if (this.settings.isTextOnlyBack || (0, isTesting_1.default)() || !url) {
                return '';
            }
            const newName = (0, getUniqueFileName_1.default)(url);
            const audioRequest = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
            const contents = audioRequest.data;
            this.exporter.addMedia(newName, contents);
            return `[sound:${newName}]`;
        });
    }
    embedFile(block) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = (0, getFileUrl_1.getFileUrl)(block);
            if (this.settings.isTextOnlyBack || (0, isTesting_1.default)() || !url) {
                return '';
            }
            const newName = (0, getUniqueFileName_1.default)(url);
            const fileRequest = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
            const contents = fileRequest.data;
            this.exporter.addMedia(newName, contents);
            return `<embed src="${newName}" />`;
        });
    }
    /**
     * Retrieve the back side of a toggle
     * @param block
     * @param handleChildren
     * @returns
     */
    getBackSide(block, handleChildren) {
        return __awaiter(this, void 0, void 0, function* () {
            let response2;
            try {
                response2 = yield this.api.getBlocks({
                    createdAt: block.created_time,
                    lastEditedAt: block.last_edited_time,
                    id: block.id,
                    all: this.useAll,
                    type: block.type,
                });
                const requestChildren = response2.results;
                return yield (0, renderBack_1.renderBack)(this, requestChildren, response2, handleChildren);
            }
            catch (e) {
                console.info('Get back side failed');
                console.error(e);
                return null;
            }
        });
    }
    __notionLink(id, notionBaseLink) {
        return notionBaseLink
            ? `${notionBaseLink}#${id.replace(/-/g, '')}`
            : undefined;
    }
    getFlashcards(rules, flashcardBlocks, tags, notionBaseLink) {
        return __awaiter(this, void 0, void 0, function* () {
            let cards = [];
            let counter = 0;
            for (const block of flashcardBlocks) {
                // Assume it's a basic card then check for children
                const name = yield (0, blockToStaticMarkup_1.blockToStaticMarkup)(this, block);
                let back = '';
                if ((0, isColumnList_1.default)(block) && rules.useColums()) {
                    const secondColumn = yield (0, getColumn_1.default)(block.id, this, 1);
                    if (secondColumn) {
                        back = yield (0, BlockColumn_1.default)(secondColumn, this);
                    }
                }
                else {
                    back = yield this.getBackSide(block);
                }
                if (!name) {
                    console.debug('name is not valid for front, skipping', name, back);
                    continue;
                }
                const ankiNote = new Note_1.default(name, back !== null && back !== void 0 ? back : '');
                ankiNote.media = this.exporter.media;
                let isBasicType = true;
                // Look for cloze deletion cards
                if (this.settings.isCloze) {
                    const clozeCard = yield (0, getClozeDeletionCard_1.default)(block);
                    if (clozeCard) {
                        isBasicType = false;
                        ankiNote.copyValues(clozeCard);
                    }
                }
                // Look for input cards
                if (this.settings.useInput) {
                    const inputCard = yield (0, getInputCard_1.default)(rules, block);
                    if (inputCard) {
                        isBasicType = false;
                        ankiNote.copyValues(inputCard);
                    }
                }
                ankiNote.back = back || '';
                ankiNote.notionLink = this.__notionLink(block.id, notionBaseLink);
                if (this.settings.addNotionLink) {
                    ankiNote.back += (0, RenderNotionLink_1.default)(ankiNote.notionLink, this);
                }
                ankiNote.notionId = this.settings.useNotionId ? block.id : undefined;
                ankiNote.media = this.exporter.media;
                this.exporter.media = [];
                const tr = TagRegistry_1.default.getInstance();
                ankiNote.tags =
                    rules.TAGS === 'heading' ? tr.headings : tr.strikethroughs;
                ankiNote.number = counter++;
                ankiNote.name = (0, preserveNewlinesIfApplicable_1.default)(ankiNote.name, this.settings);
                if (ankiNote.back) {
                    ankiNote.back = (0, preserveNewlinesIfApplicable_1.default)(ankiNote.back, this.settings);
                }
                cards.push(ankiNote);
                if (!this.settings.isCherry &&
                    (this.settings.basicReversed || ankiNote.hasRefreshIcon()) &&
                    isBasicType) {
                    cards.push(ankiNote.reversed(ankiNote));
                }
                tr.clear();
            }
            if (this.settings.isCherry) {
                cards = cards.filter((c) => c.hasCherry());
            }
            if (this.settings.isAvocado) {
                cards = cards.filter((c) => !c.hasAvocado());
            }
            if (this.settings.useTags && tags.length > 0) {
                cards.forEach((c) => {
                    c.tags || (c.tags = []);
                    c.tags = tags.concat((0, sanitizeTags_1.default)(c.tags));
                });
            }
            return cards; // .filter((c) => !c.isValid());
        });
    }
    findFlashcards(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const { parentType, topLevelId, rules, decks } = locator;
            if (parentType === 'page') {
                return this.findFlashcardsFromPage(locator);
            }
            else if (parentType === 'database') {
                const dbResult = yield this.api.queryDatabase(topLevelId);
                const database = yield this.api.getDatabase(topLevelId);
                const dbName = yield this.api.getDatabaseTitle(database, this.settings);
                let dbDecks = [];
                for (const entry of dbResult.results) {
                    dbDecks = yield this.findFlashcardsFromPage({
                        parentType: 'database',
                        topLevelId: entry.id,
                        rules,
                        decks,
                        parentName: dbName,
                    });
                    return dbDecks;
                }
            }
            else {
                throw new Error(`
        Unsupported '${parentType}'!
        Please report a bug.
        `);
            }
            return decks;
        });
    }
    findFlashcardsFromPage(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const { topLevelId, rules, parentName } = locator;
            let { decks } = locator;
            const page = yield this.api.getPage(topLevelId);
            const tags = yield this.api.getTopLevelTags(topLevelId, rules);
            const response = yield this.api.getBlocks({
                createdAt: page.created_time,
                lastEditedAt: page.last_edited_time,
                id: topLevelId,
                all: rules.UNLIMITED,
                type: 'page',
            });
            const blocks = response.results;
            const flashCardTypes = rules.flaschardTypeNames();
            const title = yield this.api.getPageTitle(page, this.settings);
            if (!this.firstPageTitle) {
                this.firstPageTitle = title;
            }
            if (rules.permitsDeckAsPage() && page) {
                // Locate the card blocks to be used from the parser rules
                const cBlocks = blocks.filter((b) => {
                    if (!(0, client_1.isFullBlock)(b)) {
                        return false;
                    }
                    return flashCardTypes.includes(b.type);
                });
                this.settings.parentBlockId = page.id;
                let notionBaseLink = this.settings.addNotionLink && this.settings.parentBlockId
                    ? (0, client_1.isFullPage)(page)
                        ? page === null || page === void 0 ? void 0 : page.url
                        : undefined
                    : undefined;
                const cards = yield this.getFlashcards(rules, cBlocks, tags, notionBaseLink);
                const deck = new Deck_1.default((0, deckNameToText_1.toText)((0, getDeckname_1.default)(parentName, title)), Deck_1.default.CleanCards(cards), undefined, helper_1.NOTION_STYLE, (0, get16DigitRandomId_1.default)(), this.settings);
                decks.push(deck);
            }
            if (this.settings.isAll) {
                const subDecks = blocks.filter((b) => {
                    if ('type' in b) {
                        return rules.SUB_DECKS.includes(b.type);
                    }
                });
                for (const sd of subDecks) {
                    if ((0, client_1.isFullBlock)(sd)) {
                        if (sd.type === 'child_database' &&
                            rules.SUB_DECKS.includes('child_database')) {
                            const dbDecks = yield this.handleChildDatabase(sd, rules);
                            decks.push(...dbDecks);
                            continue;
                        }
                        const res = yield this.api.getBlocks({
                            createdAt: sd.created_time,
                            lastEditedAt: sd.last_edited_time,
                            id: sd.id,
                            all: rules.UNLIMITED,
                            type: sd.type,
                        });
                        let cBlocks = res.results.filter((b) => flashCardTypes.includes(b.type));
                        this.settings.parentBlockId = sd.id;
                        const cards = yield this.getFlashcards(rules, cBlocks, tags, undefined);
                        let subDeckName = (0, getSubDeckName_1.default)(sd);
                        decks.push(new Deck_1.default((0, getDeckname_1.default)(this.settings.deckName || this.firstPageTitle, subDeckName), cards, undefined, helper_1.NOTION_STYLE, (0, get16DigitRandomId_1.default)(), this.settings));
                        continue;
                    }
                    const subPage = yield this.api.getPage(sd.id);
                    if (subPage && (0, client_1.isFullBlock)(sd)) {
                        decks = yield this.findFlashcardsFromPage({
                            parentType: sd.type,
                            topLevelId: sd.id,
                            rules,
                            decks,
                            parentName: parentName,
                        });
                    }
                }
            }
            console.log('have ', decks.length, ' decks so far');
            return decks;
        });
    }
    handleChildDatabase(sd, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbResult = yield this.api.queryDatabase(sd.id);
            const database = yield this.api.getDatabase(sd.id);
            const dbName = yield this.api.getDatabaseTitle(database, this.settings);
            let dbDecks = [];
            for (const entry of dbResult.results) {
                const entryDecks = yield this.findFlashcardsFromPage({
                    parentType: 'database',
                    topLevelId: entry.id,
                    rules,
                    decks: [],
                    parentName: dbName,
                });
                dbDecks.push(...entryDecks);
            }
            return dbDecks;
        });
    }
}
exports.default = BlockHandler;
//# sourceMappingURL=BlockHandler.js.map