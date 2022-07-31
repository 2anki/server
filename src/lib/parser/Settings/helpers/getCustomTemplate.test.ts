import { getCustomTemplate } from './getCustomTemplate';

const BASIC_TEMPLATE_FILE = {
  parent: '',
  name: '',
  front: '',
  back: '',
  styling: '',
  storageKey: 'n2a-basic',
};

const CLOZE_TEMPLATE_FILE = { ...BASIC_TEMPLATE_FILE, storageKey: 'n2a-cloze' };
test.each([
  ['basic template', 'n2a-basic'],
  ['cloze template', 'n2a-cloze'],
  ['input template', 'n2a-input'],
])('%s', (_, storageKey) => {
  expect(
    getCustomTemplate(storageKey, [BASIC_TEMPLATE_FILE, CLOZE_TEMPLATE_FILE])
      ?.storageKey
  ).toBe(storageKey);
});
