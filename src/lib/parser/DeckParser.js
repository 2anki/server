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
exports.DeckParser = void 0;
const cheerio = __importStar(require("cheerio"));
const preserveNewlinesIfApplicable_1 = __importDefault(require("../../services/NotionService/helpers/preserveNewlinesIfApplicable"));
const sanitizeTags_1 = __importDefault(require("../anki/sanitizeTags"));
const Deck_1 = __importDefault(require("./Deck"));
const Note_1 = __importDefault(require("./Note"));
const WorkSpace_1 = __importDefault(require("./WorkSpace"));
const CustomExporter_1 = __importDefault(require("./exporters/CustomExporter"));
const handleClozeDeletions_1 = __importDefault(require("./helpers/handleClozeDeletions"));
const replaceAll_1 = __importDefault(require("./helpers/replaceAll"));
const get16DigitRandomId_1 = __importDefault(require("../../shared/helpers/get16DigitRandomId"));
const format_1 = require("../anki/format");
const FallbackParser_1 = __importDefault(require("./experimental/FallbackParser"));
const embedFile_1 = require("./exporters/embedFile");
const getYouTubeEmbedLink_1 = __importDefault(require("./helpers/getYouTubeEmbedLink"));
const getYouTubeID_1 = __importDefault(require("./helpers/getYouTubeID"));
const types_1 = require("../storage/types");
const checks_1 = require("../storage/checks");
const getFileContents_1 = require("./getFileContents");
const handleNestedBulletPointsInMarkdown_1 = require("./handleNestedBulletPointsInMarkdown");
const checkFlashcardsLimits_1 = require("../User/checkFlashcardsLimits");
const extractStyles_1 = require("./extractStyles");
const withFontSize_1 = require("./withFontSize");
const transformDetailsTagToNotionToggleList_1 = require("./transformDetailsTagToNotionToggleList");
const findNotionToggleLists_1 = require("./findNotionToggleLists");
const constants_1 = require("../error/constants");
const extractDeckName_1 = require("../extractDeckName");
class DeckParser {
    get name() {
        return this.payload[0].name;
    }
    constructor(input) {
        var _a;
        this.settings = input.settings;
        this.files = input.files || [];
        this.firstDeckName = input.name;
        this.noLimits = input.noLimits;
        this.globalTags = null;
        this.payload = [];
        this.workspace = (_a = input.workspace) !== null && _a !== void 0 ? _a : new WorkSpace_1.default(true, 'fs');
        this.customExporter = new CustomExporter_1.default(input.name, this.workspace.location);
        this.processFirstFile(input.name);
    }
    processFirstFile(name) {
        const firstFile = this.files.find((file) => (0, types_1.isFileNameEqual)(file, name));
        if (this.settings.nestedBulletPoints && (0, checks_1.isMarkdownFile)(name)) {
            const contents = (0, getFileContents_1.getFileContents)(firstFile, false);
            this.payload = (0, handleNestedBulletPointsInMarkdown_1.handleNestedBulletPointsInMarkdown)({
                name,
                contents: contents === null || contents === void 0 ? void 0 : contents.toString(),
                deckName: this.settings.deckName,
                decks: [],
                settings: this.settings,
                exporter: this.customExporter,
                workspace: this.workspace,
                files: this.files,
            });
        }
        else if ((0, checks_1.isHTMLFile)(name)) {
            const contents = (0, getFileContents_1.getFileContents)(firstFile, true);
            this.payload = contents
                ? this.handleHTML(name, contents.toString(), this.settings.deckName || '', [])
                : [];
        }
        else {
            this.payload = [];
        }
    }
    findNextPage(href) {
        var _a;
        if (!href) {
            console.debug(`skipping next page, due to href being ${href}`);
            return undefined;
        }
        const next = global.decodeURIComponent(href);
        const nextFile = this.files.find((file) => file.name.match(next.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&')));
        return (_a = nextFile === null || nextFile === void 0 ? void 0 : nextFile.contents) === null || _a === void 0 ? void 0 : _a.toString();
    }
    noteHasCherry(note) {
        const cherry = '&#x1F352;';
        return (note.name.includes(cherry) ||
            note.back.includes(cherry) ||
            note.name.includes('🍒') ||
            note.back.includes('🍒'));
    }
    noteHasAvocado(note) {
        const avocado = '&#x1F951';
        return note.name.includes(avocado) || note.name.includes('🥑');
    }
    findIndentedToggleLists(dom) {
        const selector = '.page-body > details';
        return dom(selector).toArray();
    }
    removeNestedToggles(input) {
        return input
            .replace(/<details(.*?)>(.*?)<\/details>/g, '')
            .replace(/<summary>(.*?)<\/summary>/g, '')
            .replace(/<li><\/li>/g, '')
            .replace(/<ul[^/>][^>]*><\/ul>/g, '')
            .replace(/<\/details><\/li><\/ul><\/details><\/li><\/ul>/g, '')
            .replace(/<\/details><\/li><\/ul>/g, '')
            .replace(/<p[^/>][^>]*><\/p>/g, '')
            .replace('<summary class="toggle"></summary>', '');
    }
    getLink(pageId, note) {
        try {
            const page = pageId.replace(/-/g, '');
            const link = `https://www.notion.so/${page}#${note.notionId}`;
            return `
                <a
                style="text-decoration: none; color: grey;"
                href="${link}">
                  Open in Notion
                </a>
                `;
        }
        catch (error) {
            console.info('experienced error while getting link');
            console.error(error);
            return null;
        }
    }
    removeNewlinesInSVGPathAttributeD(html) {
        const dom = cheerio.load(html);
        const pathElements = dom('path');
        for (const pathElement of pathElements) {
            if ('attribs' in pathElement && 'd' in pathElement.attribs) {
                const dAttribute = pathElement.attribs.d;
                const newDAttribute = dAttribute.replace(/\n/g, '').trim();
                dom(pathElement).attr('d', newDAttribute);
            }
        }
        return dom.html();
    }
    getFirstHeadingText(dom) {
        try {
            const firstHeading = dom('h1').first();
            return firstHeading.text();
        }
        catch (e) {
            console.error(e);
            return undefined;
        }
    }
    handleHTML(fileName, contents, deckName, decks) {
        let dom = this.loadDOM(contents);
        const style = (0, withFontSize_1.withFontSize)((0, extractStyles_1.extractStyles)(dom), this.settings.fontSize);
        let image = this.extractCoverImage(dom);
        const name = (0, extractDeckName_1.extractName)({
            name: deckName ||
                dom('title').text() ||
                this.getFirstHeadingText(dom) ||
                fileName ||
                'Default',
            pageIcon: this.extractPageIcon(dom),
            decksCount: decks.length,
            settings: this.settings,
        });
        // XXX: review this tag reassignment, does it overwrite?
        this.globalTags = this.extractGlobalTags(dom);
        const toggleList = this.extractToggleLists(dom);
        const paragraphs = this.extractCardsFromParagraph(dom);
        let cards = this.extractCards(dom, toggleList);
        const disableIndentedBullets = this.settings.disableIndentedBulletPoints;
        // Note: this is a fallback behaviour until we can provide people more flexibility on picking non-toggles
        if (cards.length === 0) {
            cards.push(...[
                ...this.extractCardsFromLists(dom, disableIndentedBullets),
                ...paragraphs,
            ]);
        }
        else if (this.settings.disableIndentedBulletPoints) {
            cards.push(...[...this.extractCardsFromLists(dom, disableIndentedBullets)]);
        }
        //  Prevent bad cards from leaking out
        cards = cards.filter(Boolean);
        decks.push(new Deck_1.default(name, cards, image, style, (0, get16DigitRandomId_1.default)(), this.settings));
        const subpages = dom('.link-to-page').toArray();
        for (const page of subpages) {
            const spDom = dom(page);
            const ref = spDom.find('a').first();
            const href = ref.attr('href');
            const pageContent = this.findNextPage(href);
            if (pageContent && name) {
                const subDeckName = spDom.find('title').text() || ref.text();
                this.handleHTML(fileName, pageContent.toString(), `${name}::${subDeckName}`, decks);
            }
        }
        return decks;
    }
    extractGlobalTags(dom) {
        return dom('.page-body > p > del');
    }
    // https://stackoverflow.com/questions/6903823/regex-for-youtube-id
    _getYouTubeID(input) {
        return this.ensureNotNull(input, () => {
            try {
                return (0, getYouTubeID_1.default)(input);
            }
            catch (error) {
                console.debug('error in getYouTubeID');
                console.error(error);
                return null;
            }
        });
    }
    ensureNotNull(input, cb) {
        if (!input || !input.trim()) {
            return null;
        }
        return cb();
    }
    getSoundCloudURL(input) {
        return this.ensureNotNull(input, () => {
            try {
                const sre = /https?:\/\/soundcloud\.com\/\S*/gi;
                const m = input.match(sre);
                if (!m || m.length === 0) {
                    return null;
                }
                return m[0].split('">')[0];
            }
            catch (error) {
                console.debug('error in getSoundCloudURL');
                console.error(error);
                return null;
            }
        });
    }
    getMP3File(input) {
        return this.ensureNotNull(input, () => {
            try {
                const m = input.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i);
                if (!m || m.length < 3) {
                    return null;
                }
                const ma = m[2];
                if (!(0, format_1.isValidAudioFile)(ma) || ma.startsWith('http')) {
                    return null;
                }
                return ma;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    treatBoldAsInput(input, inline) {
        const dom = cheerio.load(input);
        const underlines = dom('strong');
        let mangle = input;
        let answer = '';
        underlines.each((_i, elem) => {
            const v = dom(elem).html();
            if (v) {
                const old = `<strong>${v}</strong>`;
                mangle = (0, replaceAll_1.default)(mangle, old, inline ? v : '{{type:Input}}');
                answer = v;
            }
        });
        return { mangle, answer };
    }
    locateTags(card) {
        const input = [card.name, card.back];
        for (const i of input) {
            if (!i) {
                continue;
            }
            const dom = cheerio.load(i);
            const deletionsDOM = dom('del');
            const deletionsArray = [deletionsDOM, this.globalTags];
            if (!card.tags) {
                card.tags = [];
            }
            for (const deletions of deletionsArray) {
                if (!deletions) {
                    continue;
                }
                deletions.each((_i, elem) => {
                    const del = dom(elem);
                    card.tags.push(...(0, sanitizeTags_1.default)(del.text().split(',')));
                    card.back = (0, replaceAll_1.default)(card.back, `<del>${del.html()}</del>`, '');
                    card.name = (0, replaceAll_1.default)(card.name, `<del>${del.html()}</del>`, '');
                });
            }
        }
        return card;
    }
    build(ws) {
        if (ws.location !== this.workspace.location) {
            console.debug('workspace location changed for build');
            console.debug(ws.location);
            this.customExporter = new CustomExporter_1.default(this.firstDeckName, ws.location);
        }
        for (const d of this.payload) {
            const deck = d;
            deck.id = (0, get16DigitRandomId_1.default)();
            // Is it necessary to delete the style here?
            // delete deck.style;
            // Counter for perserving the order in Anki deck.
            let counter = 0;
            const addThese = [];
            for (const c of deck.cards) {
                let card = c;
                card.enableInput = this.settings.useInput;
                card.cloze = this.settings.isCloze;
                card.number = counter++;
                if (card.cloze) {
                    card.name = (0, handleClozeDeletions_1.default)(card.name);
                }
                if (this.settings.useInput && card.name.includes('<strong>')) {
                    const inputInfo = this.treatBoldAsInput(card.name, false);
                    card.name = inputInfo.mangle;
                    card.answer = inputInfo.answer;
                }
                card.media = [];
                [card.name, card.back].forEach((content) => {
                    if (content) {
                        const dom = cheerio.load(content);
                        const images = dom('img');
                        const decodeURIComponent = global.decodeURIComponent;
                        if (images.length > 0) {
                            images.each((_i, elem) => {
                                const originalName = dom(elem).attr('src');
                                if (originalName && (0, checks_1.isImageFileEmbedable)(originalName)) {
                                    const newName = (0, embedFile_1.embedFile)({
                                        exporter: this.customExporter,
                                        files: this.files,
                                        filePath: decodeURIComponent(originalName),
                                        workspace: ws,
                                    });
                                    if (newName) {
                                        dom(elem).attr('src', newName);
                                        card.media.push(newName);
                                    }
                                }
                            });
                            if (content === card.name) {
                                card.name = dom.html();
                            }
                            else {
                                card.back = dom.html();
                            }
                        }
                    }
                });
                const audiofile = this.getMP3File(card.back);
                if (audiofile) {
                    if (this.settings.removeMP3Links) {
                        card.back = card.back.replace(/<figure.*<a\shref=["'].*\.mp3["']>.*<\/a>.*<\/figure>/, '');
                    }
                    const newFileName = (0, embedFile_1.embedFile)({
                        exporter: this.customExporter,
                        files: this.files,
                        filePath: global.decodeURIComponent(audiofile),
                        workspace: ws,
                    });
                    if (newFileName) {
                        card.back += `[sound:${newFileName}]`;
                        card.media.push(newFileName);
                    }
                }
                // Check YouTube
                const id = this._getYouTubeID(card.back);
                if (id) {
                    const ytSrc = (0, getYouTubeEmbedLink_1.default)(id);
                    const video = `<iframe width='560' height='315' src='${ytSrc}' frameborder='0' allowfullscreen></iframe>`;
                    card.back += video;
                }
                const soundCloudUrl = this.getSoundCloudURL(card.back);
                if (soundCloudUrl) {
                    const audio = `<iframe width='100%' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=${soundCloudUrl}'></iframe>`;
                    card.back += audio;
                }
                if (this.settings.useInput && card.back.includes('<strong>')) {
                    const inputInfo = this.treatBoldAsInput(card.back, true);
                    card.back = inputInfo.mangle;
                }
                if (!card.tags) {
                    card.tags = [];
                }
                if (this.settings.useTags) {
                    card = this.locateTags(card);
                }
                if (this.settings.basicReversed) {
                    const note = new Note_1.default(card.back, card.name);
                    note.tags = card.tags;
                    note.media = card.media;
                    note.number = counter++;
                    addThese.push(note);
                }
                if (this.settings.reversed || card.hasRefreshIcon()) {
                    const tmp = card.back;
                    card.back = card.name;
                    card.name = tmp;
                    // Due to backwards compatability, do not increment number here
                    card.number = -1;
                }
            }
            deck.cards = Deck_1.default.CleanCards(deck.cards.concat(addThese));
        }
        this.payload[0].settings = this.settings;
        this.customExporter.configure(this.payload);
        return this.customExporter.save();
    }
    tryExperimental() {
        const fallback = new FallbackParser_1.default(this.files);
        this.payload = fallback.run(this.settings);
        if (!this.payload ||
            this.payload.length === 0 ||
            this.totalCardCount() === 0) {
            throw constants_1.NO_PACKAGE_ERROR;
        }
        this.payload[0].settings = this.settings;
        this.customExporter.configure(this.payload);
        return this.customExporter.save();
    }
    totalCardCount() {
        if (this.payload.length === 0) {
            return 0;
        }
        return this.payload.map((p) => p.cardCount).reduce((a, b) => a + b);
    }
    loadDOM(contents) {
        return cheerio.load(this.removeNewlinesInSVGPathAttributeD(this.settings.noUnderline
            ? contents.replace(/border-bottom:0.05em solid/g, '')
            : contents));
    }
    extractCoverImage(dom) {
        const pageCoverImage = dom('.page-cover-image');
        if (pageCoverImage) {
            return pageCoverImage.attr('src');
        }
        return undefined;
    }
    extractPageIcon(dom) {
        const pageIcon = dom('.page-header-icon > .icon');
        return pageIcon.html();
    }
    extractToggleLists(dom) {
        const foundToggleLists = (0, findNotionToggleLists_1.findNotionToggleLists)(dom, {
            isCherry: this.settings.isCherry,
            isAll: this.settings.isAll,
            disableIndentedBulletPoints: this.settings.disableIndentedBulletPoints,
        });
        const details = dom('details').toArray();
        /**
         * The document has toggles but they are not in the Notion format.
         */
        const convertedToggleLists = foundToggleLists.length === 0 && details.length > 0
            ? (0, transformDetailsTagToNotionToggleList_1.transformDetailsTagToNotionToggleList)(dom, details)
            : [];
        return [
            ...foundToggleLists,
            ...convertedToggleLists,
            ...this.findIndentedToggleLists(dom),
        ];
    }
    extractCards(dom, toggleList) {
        let cards = [];
        const pageId = dom('article').attr('id');
        toggleList.forEach((t) => {
            // We want to perserve the parent's style, so getting the class
            const p = dom(t);
            const parentUL = p;
            const parentClass = p.attr('class') || '';
            this.checkLimits(cards.length, []);
            if (this.settings.toggleMode === 'open_toggle') {
                dom('details').attr('open', '');
            }
            else if (this.settings.toggleMode === 'close_toggle') {
                dom('details').removeAttr('open');
            }
            if (parentUL) {
                dom('details').addClass(parentClass);
                dom('summary').addClass(parentClass);
                const summary = parentUL.find('summary').first();
                let toggle = parentUL.find('details').first();
                if (!(toggle === null || toggle === void 0 ? void 0 : toggle.html())) {
                    toggle = parentUL.find('.indented');
                }
                if (summary && summary.text()) {
                    const validSummary = (() => (0, preserveNewlinesIfApplicable_1.default)(summary.html() || '', this.settings))();
                    const front = parentClass
                        ? `<div class='${parentClass}'>${validSummary}</div>`
                        : validSummary;
                    if (toggle || this.settings.maxOne) {
                        const toggleHTML = toggle.html();
                        if (toggleHTML) {
                            let b = toggleHTML.replace(summary.html() || '', '');
                            if (this.settings.isTextOnlyBack) {
                                const paragraphs = dom(toggle).find('> p').toArray();
                                b = '';
                                for (const paragraph of paragraphs) {
                                    if (paragraph) {
                                        b += dom(paragraph).html();
                                    }
                                }
                            }
                            const backSide = (() => {
                                let mangleBackSide = b;
                                if (this.settings.maxOne) {
                                    mangleBackSide = this.removeNestedToggles(b);
                                }
                                if (this.settings.perserveNewLines) {
                                    mangleBackSide = (0, replaceAll_1.default)(mangleBackSide, '\n', '<br />');
                                }
                                return mangleBackSide;
                            })();
                            const note = new Note_1.default(front || '', backSide);
                            note.notionId = parentUL.attr('id');
                            if (note.notionId && this.settings.addNotionLink) {
                                const link = this.getLink(pageId, note);
                                if (link !== null) {
                                    note.back += link;
                                }
                            }
                            if ((this.settings.isAvocado && this.noteHasAvocado(note)) ||
                                (this.settings.isCherry && !this.noteHasCherry(note))) {
                                console.debug('dropping due to matching rules');
                            }
                            else {
                                cards.push(note);
                            }
                        }
                    }
                }
            }
        });
        return cards;
    }
    extractCardsFromParagraph(dom) {
        const paragraphs = dom('p').toArray();
        return paragraphs.map((p) => { var _a; return new Note_1.default((_a = dom(p).html()) !== null && _a !== void 0 ? _a : '', ''); });
    }
    extractCardsFromLists(dom, disableIndentedBullets) {
        const cards = [];
        const lists = !disableIndentedBullets
            ? [...dom('ul').toArray(), ...dom('ol').toArray()]
            : [...dom('.page-body > .bulleted-list').toArray()];
        lists.forEach((list) => {
            var _a, _b;
            if (!disableIndentedBullets) {
                for (const child of dom(list).find('li')) {
                    this.checkLimits(cards.length, []);
                    cards.push(new Note_1.default((_a = dom(child).html()) !== null && _a !== void 0 ? _a : '', ''));
                }
            }
            else {
                this.checkLimits(cards.length, []);
                cards.push(new Note_1.default((_b = dom(list).html()) !== null && _b !== void 0 ? _b : '', ''));
            }
        });
        return cards;
    }
    checkLimits(cards, decks) {
        (0, checkFlashcardsLimits_1.checkFlashcardsLimits)({
            cards: cards,
            decks: decks,
            paying: this.noLimits,
        });
    }
}
exports.DeckParser = DeckParser;
//# sourceMappingURL=DeckParser.js.map