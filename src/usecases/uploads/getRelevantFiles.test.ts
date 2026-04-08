import { setupTests } from '../../test/configure-jest';
import { getRelevantFiles } from './getRelevantFiles';

beforeEach(() => setupTests());

test('matches image files when HTML has Notion ID but image folder does not', () => {
  const htmlName =
    'Shared/My Topic ab12cd34ef56ab12cd34ef56ab12cd34.html';
  const allFiles = [
    { name: htmlName, contents: '<html></html>' },
    {
      name: 'Shared/My Topic/screenshot_1.png',
      contents: 'fake-image',
    },
    {
      name: 'Shared/My Topic/image.png',
      contents: 'fake-image',
    },
    { name: 'Other Page/unrelated.png', contents: 'fake-image' },
  ];

  const result = getRelevantFiles(htmlName, allFiles);

  expect(result.length).toBe(3);
  expect(result.map((f) => f.name)).toContain(htmlName);
  expect(result.map((f) => f.name)).toContain(
    'Shared/My Topic/screenshot_1.png'
  );
  expect(result.map((f) => f.name)).toContain(
    'Shared/My Topic/image.png'
  );
  expect(result.map((f) => f.name)).not.toContain(
    'Other Page/unrelated.png'
  );
});

test('still works when HTML has no Notion ID', () => {
  const htmlName = 'My Deck.html';
  const allFiles = [
    { name: htmlName, contents: '<html></html>' },
    { name: 'My Deck/image.png', contents: 'fake' },
  ];

  const result = getRelevantFiles(htmlName, allFiles);

  expect(result.length).toBe(2);
});
