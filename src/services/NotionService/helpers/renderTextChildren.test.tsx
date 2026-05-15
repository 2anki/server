import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import renderTextChildren from './renderTextChildren';
import CardOption from '../../../lib/parser/Settings';

const baseAnnotations = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: 'default' as const,
};

const defaultSettings = new CardOption(CardOption.LoadDefaultOptions());

function makeMention(
  plainText: string,
  annotations: Partial<typeof baseAnnotations> = {}
): RichTextItemResponse {
  return {
    type: 'mention',
    plain_text: plainText,
    href: null,
    annotations: { ...baseAnnotations, ...annotations },
    mention: {
      type: 'page',
      page: { id: 'some-page-id' },
    },
  } as unknown as RichTextItemResponse;
}

describe('renderTextChildren — mention support', () => {
  it('renders the plain_text of an annotated mention', () => {
    const items: RichTextItemResponse[] = [
      makeMention('Alexander', { bold: true }),
    ];
    const result = renderTextChildren(items, defaultSettings);
    expect(result).toContain('Alexander');
    expect(result).toContain('<strong>');
  });

  it('renders an unannotated mention as plain text', () => {
    const items: RichTextItemResponse[] = [makeMention('My Page')];
    const result = renderTextChildren(items, defaultSettings);
    expect(result).toContain('My Page');
    expect(result).not.toContain('unsupported type');
  });

  it('does not include a link for mention types', () => {
    const items: RichTextItemResponse[] = [makeMention('Linked Page')];
    const result = renderTextChildren(items, defaultSettings);
    expect(result).not.toContain('<a ');
  });
});
