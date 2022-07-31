import path from 'path';
import fs from 'fs';

import { parseTemplate } from './parseTemplate';

test('loads valid JSON', () => {
  const input = fs
    .readFileSync(path.join(__dirname, '../../../../templates/n2a-basic.json'))
    .toString();
  const template = parseTemplate(input);
  expect(template.name).toBe('n2a-basic');
});

test('return undefined', () => {
  expect(parseTemplate(undefined)).toBeUndefined();
});
