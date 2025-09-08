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
const dotenv = __importStar(require("dotenv"));
const CustomExporter_1 = __importDefault(require("../../../lib/parser/exporters/CustomExporter"));
const ParserRules_1 = __importDefault(require("../../../lib/parser/ParserRules"));
const CardOption_1 = __importDefault(require("../../../lib/parser/Settings/CardOption"));
const WorkSpace_1 = __importDefault(require("../../../lib/parser/WorkSpace"));
const configure_jest_1 = require("../../../test/configure-jest");
const test_utils_1 = require("../../../test/test-utils");
const MockNotionAPI_1 = __importDefault(require("../_mock/MockNotionAPI"));
const getToggleBlocks_1 = require("../helpers/getToggleBlocks");
const BlockHandler_1 = __importDefault(require("./BlockHandler"));
dotenv.config({ path: 'test/.env' });
const api = new MockNotionAPI_1.default(process.env.NOTION_KEY, '3');
const loadCards = (options, pageId, ws, rules) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = new CardOption_1.default(options);
    const r = rules || new ParserRules_1.default();
    const exporter = new CustomExporter_1.default('', ws.location);
    const bl = new BlockHandler_1.default(exporter, api, settings);
    const decks = yield bl.findFlashcards({
        parentType: 'page',
        topLevelId: pageId,
        rules: r,
        decks: [],
        parentName: '',
    });
    return decks[0].cards;
});
function findCardByName(name, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const flashcards = yield loadCards(options, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        return flashcards.find((f) => f.name.includes(name));
    });
}
beforeEach(() => (0, configure_jest_1.setupTests)());
jest.mock('get-notion-object-title', () => ({
    getNotionObjectTitle: jest.fn(),
}));
describe('BlockHandler', () => {
    test.skip('Get Notion Page', () => __awaiter(void 0, void 0, void 0, function* () {
        const page = yield api.getPage('446d09aa05d041058c16e56232188e2b');
        const title = yield api.getPageTitle(page, new CardOption_1.default({}));
        expect(title).toBe('Testing');
    }));
    test('Get Blocks', () => __awaiter(void 0, void 0, void 0, function* () {
        // This should be mocked
        const blocks = yield api.getBlocks({
            createdAt: '',
            lastEditedAt: '',
            id: '07a7b319183642b9afecdcc4c456f73d',
            all: true,
            type: 'page',
        });
        const topLevelToggles = (0, getToggleBlocks_1.getToggleBlocks)(blocks.results);
        expect(topLevelToggles.length).toEqual(14);
    }));
    test.skip('Toggle Headings in HTML export', () => __awaiter(void 0, void 0, void 0, function* () {
        const r = new ParserRules_1.default();
        r.setFlashcardTypes(['heading']);
        const cards = yield loadCards({}, '25226df63b4d4895a71f3bba01d8a8f3', new WorkSpace_1.default(true, 'fs'), r);
        console.log('cards', JSON.stringify(cards, null, 4));
        expect(cards.length).toBe(1);
    }));
    test.skip('Subpages', () => __awaiter(void 0, void 0, void 0, function* () {
        const settings = new CardOption_1.default({ all: 'true' });
        const rules = new ParserRules_1.default();
        const exporter = new CustomExporter_1.default('', new WorkSpace_1.default(true, 'fs').location);
        const bl = new BlockHandler_1.default(exporter, api, settings);
        const decks = yield bl.findFlashcards({
            parentType: 'page',
            topLevelId: test_utils_1.pageId,
            rules,
            decks: [],
            parentName: '',
        });
        expect(decks.length > 1).toBe(true);
        expect(decks[1].name.includes('::')).toBe(true);
    }));
    test.skip('Toggle Mode', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({}, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        const nestedOnes = flashcards.find((c) => c.name.match(/Nested/i));
        expect(nestedOnes === null || nestedOnes === void 0 ? void 0 : nestedOnes.back).toBe(true);
    }));
    test.skip('Strikethrough Local Tags', () => __awaiter(void 0, void 0, void 0, function* () {
        const card = yield findCardByName('This card has three tags', {
            tags: 'true',
        });
        const expected = ['global tag', 'tag a', 'tag b'];
        expect(card === null || card === void 0 ? void 0 : card.tags).toBe(expected);
    }));
    test('Basic Cards from Blocks', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ cloze: 'false' }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        const card = flashcards[0];
        expect(card.name).toBe('<ul id="e5201f35-c722-40d3-8e3a-5d218e5d80a5" class="toggle"><li><details><summary>1 - This is a basic card</summary><div><p class="" id="f83ce56a-9039-4888-81be-375b19a84790">This is the back of the card</p></div></details></li></ul>');
        expect(card.back).toBe('<p class="" id="f83ce56a-9039-4888-81be-375b19a84790">This is the back of the card</p>');
    }));
    test('Cloze Deletion from Blocks', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ cloze: 'true' }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        const card = flashcards.find((c) => c.name.includes('2 - This is a {{c1::cloze deletion}}'));
        expect(card === null || card === void 0 ? void 0 : card.back).toBe('<p class="" id="34be35bd-db68-4588-85d9-e1adc84c45a5">Extra</p>');
    }));
    test('Input Cards from Blocks', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ cloze: 'false', 'enable-input': 'true' }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        expect(flashcards.find((n) => n.name.includes('6 - 21 + 21 is '))).toBeTruthy();
    }));
    test('Enable Cherry Picking Using 🍒 Emoji', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ cherry: 'true', cloze: 'true' }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'));
        expect(flashcards.length).toBe(2);
    }));
    test("Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji", () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ avocado: 'true' }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        const avocado = flashcards.find((c) => c.name.includes('🥑'));
        expect(avocado).toBeFalsy();
    }));
    test('Use Notion ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ 'use-notion-id': 'true' }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        const card = flashcards.find((f) => f.name.includes('3 - 21 + 21 is #buddy'));
        const expected = 'a5445230-bfa9-4bf1-bc35-a706c1d129d1';
        expect(card === null || card === void 0 ? void 0 : card.notionId).toBe(expected);
    }));
    test('Strikethrough Global Tags', () => __awaiter(void 0, void 0, void 0, function* () {
        const card = yield findCardByName('This card has global tags', {
            tags: 'true',
        });
        expect(card === null || card === void 0 ? void 0 : card.tags.includes('global-tag')).toBe(true);
        expect(card === null || card === void 0 ? void 0 : card.tags.includes('global-tag')).toBe(true);
    }));
    test('Use Plain Text for Back', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ paragraph: 'true' }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        const card = flashcards.find((c) => c.name.includes('1 - This is a basic card'));
        expect(card === null || card === void 0 ? void 0 : card.back).toBe('This is the back of the card');
    }));
    test('Basic and Reversed', () => __awaiter(void 0, void 0, void 0, function* () {
        const flashcards = yield loadCards({ 'basic-reversed': 'true' }, 'fb300010f93745e882e1fd04e0cae6ef', new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        expect(flashcards.length).toBe(2);
    }));
    jest.setTimeout(10000);
    test('Enable two columns', () => __awaiter(void 0, void 0, void 0, function* () {
        const rules = new ParserRules_1.default();
        rules.setFlashcardTypes(['column_list']);
        const flashcards = yield loadCards({
            'basic-reversed': 'false',
        }, 'eb64d738c17b444ab9d8a747372bed85', new WorkSpace_1.default(true, 'fs'), rules);
        expect(flashcards.length).toBe(1);
    }));
    test('Add Notion Link', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = 'https://www.notion.so/Notion-API-Test-Page-3ce6b147ac8a425f836b51cc21825b85#e5201f35c72240d38e3a5d218e5d80a5';
        const flashcards = yield loadCards({
            'add-notion-link': 'true',
            parentBlockId: test_utils_1.pageId,
        }, test_utils_1.pageId, new WorkSpace_1.default(true, 'fs'), new ParserRules_1.default());
        const card = flashcards.find((f) => f.name.includes('1 - This is a basic card'));
        expect(card).toBeTruthy();
        expect(card === null || card === void 0 ? void 0 : card.notionLink).toBe(expected);
    }));
    test.todo('Maximum One Toggle Per Card');
    test.todo('Use All Toggle Lists');
    test.todo('Template Options');
    test.todo('Just the Reversed Flashcards');
    test.todo('Remove Underlines');
    test.todo('Download Media Files');
    test.todo('Preserve Newlines in the Toggle Header and Body');
});
//# sourceMappingURL=BlockHandler.test.js.map