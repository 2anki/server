"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const getFileContents_1 = require("./getFileContents");
(0, node_test_1.describe)('getHTMLContents', () => {
    test('returns html contents', () => {
        expect((0, getFileContents_1.getFileContents)({ contents: '<h1>html</h1>', name: 'index.html' })).toBe('<h1>html</h1>');
    });
    test('returns html for markdown', () => {
        expect((0, getFileContents_1.getFileContents)({ contents: '# md', name: 'README.md' })).toBe('<h1>md</h1>');
    });
});
//# sourceMappingURL=getHTMLContents.test.js.map