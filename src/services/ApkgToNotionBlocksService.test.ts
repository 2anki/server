import ApkgToNotionBlocksService from './ApkgToNotionBlocksService';
import {
  NormalizedCollection,
  Note,
  NoteType,
  Deck,
  Card,
} from './ApkgPreviewService/types';

function buildCollection(overrides?: {
  noteTypes?: Map<number, NoteType>;
  notes?: Map<number, Note>;
  decks?: Map<number, Deck>;
  cards?: Card[];
}): NormalizedCollection {
  const defaultNoteType: NoteType = {
    id: 1,
    name: 'Basic',
    type: 0,
    css: '',
    fields: [
      { name: 'Front', ord: 0 },
      { name: 'Back', ord: 1 },
    ],
    templates: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
  };

  const defaultNote: Note = {
    id: 100,
    mid: 1,
    tags: '',
    fields: ['What is 2+2?', 'Four'],
  };

  const defaultDeck: Deck = { id: 10, name: 'Math' };

  const defaultCard: Card = { id: 1000, nid: 100, did: 10, ord: 0 };

  return {
    noteTypes: overrides?.noteTypes ?? new Map([[1, defaultNoteType]]),
    notes: overrides?.notes ?? new Map([[100, defaultNote]]),
    decks: overrides?.decks ?? new Map([[10, defaultDeck]]),
    cards: overrides?.cards ?? [defaultCard],
  };
}

describe('ApkgToNotionBlocksService', () => {
  const service = new ApkgToNotionBlocksService();

  describe('transform', () => {
    it('creates a deck page with toggle blocks for each note', () => {
      const collection = buildCollection();
      const result = service.transform(collection);

      expect(result.deckPages).toHaveLength(1);
      expect(result.deckPages[0].title).toBe('Math');
      expect(result.deckPages[0].children).toHaveLength(1);

      const toggle = result.deckPages[0].children[0];
      expect(toggle.type).toBe('heading_3');
      expect(toggle.heading_3.rich_text[0].plain_text).toBe('What is 2+2?');
      expect(toggle.heading_3.is_toggleable).toBe(true);
      expect(toggle.heading_3.children).toHaveLength(1);
      expect(toggle.heading_3.children[0].paragraph.rich_text[0].plain_text).toBe(
        'Four'
      );
    });

    it('strips HTML tags from fields', () => {
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 1, tags: '', fields: ['<b>Bold</b> text', '<i>Italic</i> answer'] }],
      ]);
      const collection = buildCollection({ notes });
      const result = service.transform(collection);

      const toggle = result.deckPages[0].children[0];
      expect(toggle.heading_3.rich_text[0].plain_text).toBe('Bold text');
    });

    it('preserves bold formatting from HTML', () => {
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 1, tags: '', fields: ['Front', '<b>Important</b> detail'] }],
      ]);
      const collection = buildCollection({ notes });
      const result = service.transform(collection);

      const backChildren = result.deckPages[0].children[0].heading_3.children;
      const richText = backChildren[0].paragraph.rich_text;
      const boldSegment = richText.find(
        (seg: { annotations?: { bold?: boolean } }) => seg.annotations?.bold === true
      );
      expect(boldSegment).toBeDefined();
      expect(boldSegment!.plain_text).toBe('Important');
    });

    it('preserves italic formatting from HTML', () => {
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 1, tags: '', fields: ['Front', '<i>Emphasis</i> here'] }],
      ]);
      const collection = buildCollection({ notes });
      const result = service.transform(collection);

      const backChildren = result.deckPages[0].children[0].heading_3.children;
      const richText = backChildren[0].paragraph.rich_text;
      const italicSegment = richText.find(
        (seg: { annotations?: { italic?: boolean } }) => seg.annotations?.italic === true
      );
      expect(italicSegment).toBeDefined();
      expect(italicSegment!.plain_text).toBe('Emphasis');
    });

    it('creates nested deck pages for sub-decks', () => {
      const decks = new Map<number, Deck>([
        [10, { id: 10, name: 'Bio' }],
        [11, { id: 11, name: 'Bio::Cell' }],
      ]);
      const cards: Card[] = [
        { id: 1000, nid: 100, did: 11, ord: 0 },
      ];
      const collection = buildCollection({ decks, cards });
      const result = service.transform(collection);

      expect(result.deckPages).toHaveLength(1);
      expect(result.deckPages[0].title).toBe('Bio');
      expect(result.deckPages[0].subDecks).toHaveLength(1);
      expect(result.deckPages[0].subDecks[0].title).toBe('Cell');
    });

    it('adds tags as italic text at bottom of toggle', () => {
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 1, tags: ' math algebra ', fields: ['Q', 'A'] }],
      ]);
      const collection = buildCollection({ notes });
      const result = service.transform(collection);

      const toggleChildren = result.deckPages[0].children[0].heading_3.children;
      const tagBlock = toggleChildren[toggleChildren.length - 1];
      expect(tagBlock.paragraph.rich_text[0].annotations.italic).toBe(true);
      expect(tagBlock.paragraph.rich_text[0].plain_text).toContain('math');
    });

    it('handles cloze notes by stripping markers in summary', () => {
      const clozeNoteType: NoteType = {
        id: 2,
        name: 'Cloze',
        type: 1,
        css: '',
        fields: [{ name: 'Text', ord: 0 }, { name: 'Extra', ord: 1 }],
        templates: [{ name: 'Cloze', ord: 0, qfmt: '{{cloze:Text}}', afmt: '{{cloze:Text}}' }],
      };
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 2, tags: '', fields: ['{{c1::Paris}} is the capital of France', ''] }],
      ]);
      const noteTypes = new Map<number, NoteType>([[2, clozeNoteType]]);
      const collection = buildCollection({ noteTypes, notes });
      const result = service.transform(collection);

      const toggle = result.deckPages[0].children[0];
      expect(toggle.heading_3.rich_text[0].plain_text).toBe(
        'Paris is the capital of France'
      );
    });

    it('strips media refs from fields', () => {
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 1, tags: '', fields: ['<img src="image.png">Question', 'Answer [sound:audio.mp3]'] }],
      ]);
      const collection = buildCollection({ notes });
      const result = service.transform(collection);

      const toggle = result.deckPages[0].children[0];
      expect(toggle.heading_3.rich_text[0].plain_text).not.toContain('img');
      expect(toggle.heading_3.rich_text[0].plain_text).not.toContain('image.png');
    });

    it('returns totalNotes count', () => {
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 1, tags: '', fields: ['Q1', 'A1'] }],
        [101, { id: 101, mid: 1, tags: '', fields: ['Q2', 'A2'] }],
      ]);
      const cards: Card[] = [
        { id: 1000, nid: 100, did: 10, ord: 0 },
        { id: 1001, nid: 101, did: 10, ord: 0 },
      ];
      const collection = buildCollection({ notes, cards });
      const result = service.transform(collection);

      expect(result.totalNotes).toBe(2);
    });

    it('limits to MAX_NOTES and signals truncation', () => {
      const notes = new Map<number, Note>();
      const cards: Card[] = [];
      for (let i = 0; i < 5001; i++) {
        notes.set(i, { id: i, mid: 1, tags: '', fields: [`Q${i}`, `A${i}`] });
        cards.push({ id: 10000 + i, nid: i, did: 10, ord: 0 });
      }
      const collection = buildCollection({ notes, cards });

      expect(() => service.transform(collection)).toThrow(/too large/i);
    });

    it('handles multiple decks', () => {
      const decks = new Map<number, Deck>([
        [10, { id: 10, name: 'Math' }],
        [20, { id: 20, name: 'History' }],
      ]);
      const notes = new Map<number, Note>([
        [100, { id: 100, mid: 1, tags: '', fields: ['Q1', 'A1'] }],
        [101, { id: 101, mid: 1, tags: '', fields: ['Q2', 'A2'] }],
      ]);
      const cards: Card[] = [
        { id: 1000, nid: 100, did: 10, ord: 0 },
        { id: 1001, nid: 101, did: 20, ord: 0 },
      ];
      const collection = buildCollection({ decks, notes, cards });
      const result = service.transform(collection);

      expect(result.deckPages).toHaveLength(2);
      const deckNames = result.deckPages.map((d) => d.title);
      expect(deckNames).toContain('Math');
      expect(deckNames).toContain('History');
    });
  });
});
