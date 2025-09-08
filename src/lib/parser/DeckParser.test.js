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
const configure_jest_1 = require("../../test/configure-jest");
const test_utils_1 = require("../../test/test-utils");
const CardOption_1 = __importDefault(require("./Settings/CardOption"));
beforeEach(() => (0, configure_jest_1.setupTests)());
test('Toggle Headings', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('Toggle Hea 0e02b 2.html', new CardOption_1.default({ cherry: 'false' }));
    expect(deck.cards.length).toBeGreaterThan(0);
}));
test('Grouped cloze deletions', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html', new CardOption_1.default({
        cherry: 'false',
        cloze: 'true',
        reversed: 'true',
        'basic-reversed': 'true',
    }));
    expect(deck.name).toBe('Grouped Cloze Deletions');
    expect(deck.cards.length).toBe(20);
}));
test('Cloze Deletions', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('Some Cloze Deletions 1a118169ada841a99a9aaccc7eaa6775.html', new CardOption_1.default({
        cherry: 'false',
        reversed: 'true',
        'basic-reversed': 'true',
    }));
    expect(deck.cards[0].back).toBe("<div class='toggle'>{{c2::Canberra}} was founded in {{c1::1913}}.</div>");
    expect(deck.cards[1].back).toBe("<div class='toggle'>{{c1::Canberra::city}} was founded in {{c2::1913::year}}</div>");
    expect(deck.cards[2].back).toBe("<div class='toggle'>{{c1::Canberra::city}} was founded in {{c2::1913}}</div>");
    expect(deck.cards[3].back).toBe("<div class='toggle'>{{c1::This}} is a {{c2::cloze deletion}}</div>");
    expect(deck.cards[4].back).toBe("<div class='toggle'>{{c2::Canberra}} was founded in {{c1::1913}}.</div>");
    expect(deck.cards[5].back).toEqual("<div class='toggle'>{{c1::Canberra::city}} was founded in {{c2::1913::year}}</div>");
}));
test('Colours', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('Colours 0519bf7e86d84ee4ba710c1b7ff7438e.html', new CardOption_1.default({ cherry: 'false' }));
    expect(deck.cards[0].back.includes('block-color')).toBe(true);
}));
test.skip('HTML Regression Test', (t) => {
    t.fail('please automate HTML regression check. Use this page https://www.notion.so/HTML-test-4aa53621a84a4660b69e9953f3938685.');
});
test('Nested Toggles', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('Nested Toggles.html', new CardOption_1.default({
        cherry: 'true',
        reversed: 'true',
        'basic-reversed': 'true',
    }));
    expect(deck.cards.length).toBe(12);
}));
test('Global Tags', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('Global Tag Support.html', new CardOption_1.default({ tags: 'true', cherry: 'false' }));
    // use toContain
    expect(deck.cards[0].tags.includes('global')).toBe(true);
}));
test.todo('Input Cards ');
test.todo('Multiple File Uploads');
test.todo('Test Basic Card');
test('Markdown empty deck', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('empty-deck.md', new CardOption_1.default({
        'markdown-nested-bullet-points': 'true',
    }));
    expect(deck.name).toBe('Empty Deck');
    expect(deck.cards.length).toBe(0);
}));
test('Markdown nested bullet points', () => __awaiter(void 0, void 0, void 0, function* () {
    const deck = yield (0, test_utils_1.getDeck)('simple-deck.md', new CardOption_1.default({
        'markdown-nested-bullet-points': 'true',
        reversed: 'false',
        'basic-reversed': 'false',
    }));
    expect(deck.name).toBe('Simple Deck');
    expect(deck.cards[0].name).toBe('<ul>\n<li>' + 'What is the capital of Kenya?' + '</li>\n</ul>');
    expect(deck.cards[0].back).toBe('<p>Nairobi</p>');
    expect(deck.cards[1].name).toBe('<ul>\n<li>' + 'What is the capital of Norway' + '</li>\n</ul>');
    expect(deck.cards[1].back).toBe('<p>Oslo</p>');
    expect(deck.cards[2].name).toBe('<ul>\n<li>' + 'What is the capital of Sweden' + '</li>\n</ul>');
    console.log('Deck card 2 back:', deck.cards[2].back);
    expect(deck.cards[2].back).toBe('<p>Stockholm</p>');
    expect(deck.cards[3].name).toBe('<ul>\n<li>' + 'What is the capital of Finland' + '</li>\n</ul>');
    expect(deck.cards[3].back).toBe('<p>Helsinki</p>');
    expect(deck.cards.length).toBe(4);
}));
//# sourceMappingURL=DeckParser.test.js.map