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
  test('extracts hosted image blocks and embeds <img> with ankify-{id}.{ext}', async () => {
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

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards).toHaveLength(1);
    expect(cards[0].back).toContain('Spaced repetition.');
    expect(cards[0].back).toContain('<img src="ankify-img-block-77.png">');
    expect(cards[0].media).toEqual([
      {
        block_id: 'img-block-77',
        kind: 'image',
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

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards[0].back).toContain(
      '<img src="https://cdn.example.com/diagram.png">'
    );
    expect(cards[0].media).toEqual([
      {
        block_id: 'img-block-ext',
        kind: 'image',
        source: 'external',
        url: 'https://cdn.example.com/diagram.png',
      },
    ]);
  });

  test('rewrites a YouTube external video to an iframe', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') return [toggleBlock()];
      return [
        {
          id: 'vid-1',
          type: 'video',
          video: {
            type: 'external',
            external: { url: 'https://youtu.be/dQw4w9WgXcQ' },
          },
        },
      ];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards[0].back).toContain(
      'src="https://www.youtube.com/embed/dQw4w9WgXcQ?'
    );
    expect(cards[0].media[0]).toMatchObject({ kind: 'video', source: 'external' });
  });

  test('emits an Anki [sound:] tag for audio blocks and tracks the file', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') return [toggleBlock()];
      return [
        {
          id: 'a-1',
          type: 'audio',
          audio: {
            type: 'file',
            file: { url: 'https://signed/song.mp3' },
          },
        },
      ];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards[0].back).toContain('[sound:ankify-a-1.mp3]');
    expect(cards[0].media[0]).toMatchObject({
      kind: 'audio',
      filename: 'ankify-a-1.mp3',
      source: 'file',
    });
  });

  test('renders an embed block as an iframe', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') return [toggleBlock()];
      return [
        {
          id: 'em-1',
          type: 'embed',
          embed: { url: 'https://youtu.be/dQw4w9WgXcQ' },
        },
      ];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards[0].back).toContain('<iframe');
    expect(cards[0].back).toContain('youtube.com/embed/');
  });

  test('extracts file blocks as download links and tracks them', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') return [toggleBlock()];
      return [
        {
          id: 'f-1',
          type: 'file',
          file: {
            type: 'file',
            file: { url: 'https://signed/notes.pdf' },
            name: 'class-notes.pdf',
          },
        },
      ];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards[0].back).toContain('<a href="ankify-f-1.pdf">class-notes.pdf</a>');
    expect(cards[0].media[0]).toMatchObject({ kind: 'file', filename: 'ankify-f-1.pdf' });
  });

  test('recurses into nested toggles inside a parent toggle', async () => {
    const fetchChildren = jest.fn(async (blockId: string) => {
      if (blockId === 'page-id') return [toggleBlock({ id: 'outer' })];
      if (blockId === 'outer') {
        return [
          {
            id: 'inner',
            type: 'toggle',
            has_children: true,
            toggle: { rich_text: [{ plain_text: 'sub-q' }] },
          },
        ];
      }
      if (blockId === 'inner') return [paragraphChild('sub-a')];
      return [];
    });

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards[0].back).toContain('<details>');
    expect(cards[0].back).toContain('<summary>sub-q</summary>');
    expect(cards[0].back).toContain('<p>sub-a</p>');
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

    const cards = await walkNotionPageForFlashcards('page-id', fetchChildren as never);

    expect(cards).toHaveLength(1);
    expect(cards[0].notion_block_id).toBe('t-real');
  });
});
