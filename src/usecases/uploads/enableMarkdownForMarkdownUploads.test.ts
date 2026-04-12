import { enableMarkdownForMarkdownUploads } from './enableMarkdownForMarkdownUploads';
import CardOption from '../../lib/parser/Settings/CardOption';

describe('enableMarkdownForMarkdownUploads', () => {
  it('enables nestedBulletPoints when upload contains markdown files', () => {
    const settings = new CardOption({
      'markdown-nested-bullet-points': 'false',
    });
    const fileNames = ['page.md', 'image.png'];

    const result = enableMarkdownForMarkdownUploads(fileNames, settings);

    expect(result.nestedBulletPoints).toBe(true);
  });

  it('does not change settings when no markdown files', () => {
    const settings = new CardOption({
      'markdown-nested-bullet-points': 'false',
    });
    const fileNames = ['page.html', 'image.png'];

    const result = enableMarkdownForMarkdownUploads(fileNames, settings);

    expect(result.nestedBulletPoints).toBe(false);
  });

  it('returns same settings when nestedBulletPoints already enabled', () => {
    const settings = new CardOption({
      'markdown-nested-bullet-points': 'true',
    });
    const fileNames = ['page.md'];

    const result = enableMarkdownForMarkdownUploads(fileNames, settings);

    expect(result).toBe(settings);
  });
});
