"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CardOptionsController_1 = __importDefault(require("./CardOptionsController"));
class FakeSettingsService {
    create(settings) {
        return Promise.resolve([]);
    }
    delete(owner, id) {
        return Promise.resolve();
    }
    getById(id) {
        return Promise.resolve({
            object_id: '1',
            owner: '1',
            payload: 'payload',
        });
    }
}
function testDefaultSettings(type, expectedOptions) {
    const settingsController = new CardOptionsController_1.default(new FakeSettingsService());
    const defaultOptions = settingsController.getDefaultCardOptions(type);
    expect(defaultOptions).toStrictEqual(expectedOptions);
}
describe('SettingsController', () => {
    test('returns default settings for client', () => {
        testDefaultSettings('client', {
            'add-notion-link': 'false',
            'use-notion-id': 'true',
            all: 'true',
            paragraph: 'false',
            cherry: 'false',
            avocado: 'false',
            tags: 'false',
            cloze: 'true',
            'enable-input': 'false',
            'basic-reversed': 'false',
            reversed: 'false',
            'no-underline': 'false',
            'max-one-toggle-per-card': 'true',
            'remove-mp3-links': 'true',
            'perserve-newlines': 'true',
            'process-pdfs': 'true',
            'markdown-nested-bullet-points': 'true',
            'vertex-ai-pdf-questions': 'false',
            'disable-indented-bullets': 'false',
            'image-quiz-html-to-anki': 'false',
        });
    });
    test('returns default settings for server', () => {
        testDefaultSettings('server', {
            'add-notion-link': 'false',
            'use-notion-id': 'true',
            all: 'true',
            paragraph: 'false',
            cherry: 'false',
            avocado: 'false',
            tags: 'true',
            cloze: 'true',
            'enable-input': 'false',
            'basic-reversed': 'false',
            reversed: 'false',
            'no-underline': 'false',
            'max-one-toggle-per-card': 'true',
            'perserve-newlines': 'false',
            'process-pdfs': 'true',
            'page-emoji': 'first-emoji',
            'image-quiz-html-to-anki': 'false',
            'markdown-nested-bullet-points': 'true',
        });
    });
});
//# sourceMappingURL=CardOptionsController.test.js.map