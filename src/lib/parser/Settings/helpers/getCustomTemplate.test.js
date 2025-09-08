"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getCustomTemplate_1 = require("./getCustomTemplate");
const BASIC_TEMPLATE_FILE = {
    parent: '',
    name: '',
    front: '',
    back: '',
    styling: '',
    storageKey: 'n2a-basic',
};
const CLOZE_TEMPLATE_FILE = Object.assign(Object.assign({}, BASIC_TEMPLATE_FILE), { storageKey: 'n2a-cloze' });
const INPUT_TEMPLATE_FILE = Object.assign(Object.assign({}, BASIC_TEMPLATE_FILE), { storageKey: 'n2a-input' });
test.each([
    ['basic template', 'n2a-basic'],
    ['cloze template', 'n2a-cloze'],
    ['input template', 'n2a-input'],
])('%s', (_, storageKey) => {
    var _a;
    expect((_a = (0, getCustomTemplate_1.getCustomTemplate)(storageKey, [
        BASIC_TEMPLATE_FILE,
        CLOZE_TEMPLATE_FILE,
        INPUT_TEMPLATE_FILE,
    ])) === null || _a === void 0 ? void 0 : _a.storageKey).toBe(storageKey);
});
//# sourceMappingURL=getCustomTemplate.test.js.map