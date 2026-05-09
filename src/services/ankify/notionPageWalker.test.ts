import { walkNotionPageForFlashcards } from './notionPageWalker';

const toggleBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 'toggle-1',
  type: 'toggle',
  has_children: true,
  last_edited_time: '2026-05-09T12:00:00.000Z',
  toggle: { rich_text: [{ plain_text: 'What is Anki?' }] },
  ...overrides,
});

const paragraphChild = (text: string) => ({
  type: 'paragraph',
  paragraph: { rich_text: [{ plain_text: text }] },
});

describe('walkNotionPageForFlashcards', () => {
  test('extracts image blocks from toggle children and embeds <img> in the back', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') {
        return [toggleBlock()];
      }
      return [
        paragraphChild('Spaced repetition.'),
        {
          id: 'img-block-77',
          type: 'image',
          image: {
            type: 'file',
            file: {
              url: 'https://prod-files.notion.so/abc/img.png?signed=1',
              expiry_time: '2026-05-09T13:00:00.000Z',
            },
          },
        },
      ];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren);

    expect(cards).toHaveLength(1);
    expect(cards[0].back).toContain('Spaced repetition.');
    expect(cards[0].back).toContain('<img');
    expect(cards[0].images).toEqual([
      {
        block_id: 'img-block-77',
        source: 'file',
        url: 'https://prod-files.notion.so/abc/img.png?signed=1',
        filename: 'ankify-img-block-77.png',
      },
    ]);
  });

  test('keeps external-hosted image URLs as-is in the back HTML', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') {
        return [toggleBlock()];
      }
      return [
        {
          id: 'img-block-ext',
          type: 'image',
          image: {
            type: 'external',
            external: { url: 'https://cdn.example.com/diagram.png' },
          },
        },
      ];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren);

    expect(cards[0].back).toContain(
      '<img src="https://cdn.example.com/diagram.png">'
    );
    expect(cards[0].images).toEqual([
      {
        block_id: 'img-block-ext',
        source: 'external',
        url: 'https://cdn.example.com/diagram.png',
      },
    ]);
  });

  test('skips toggles with empty front text', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') {
        return [
          toggleBlock({ id: 't-empty', toggle: { rich_text: [] } }),
          toggleBlock({ id: 't-real' }),
        ];
      }
      return [paragraphChild('answer')];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren);

    expect(cards).toHaveLength(1);
    expect(cards[0].notion_block_id).toBe('t-real');
  });
});
