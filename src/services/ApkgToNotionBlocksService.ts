import {
  NormalizedCollection,
  Note,
  NoteType,
} from './ApkgPreviewService/types';

const MAX_NOTES = 5000;
const CLOZE_REGEX = /\{\{c\d+::(.*?)(?:::.*?)?\}\}/g;
const SOUND_TAG_REGEX = /\[sound:[^\]]+\]/g;
const IMG_TAG_REGEX = /<img[^>]*>/gi;
const BOLD_REGEX = /<b>(.*?)<\/b>/gi;
const ITALIC_REGEX = /<i>(.*?)<\/i>/gi;
const STRONG_REGEX = /<strong>(.*?)<\/strong>/gi;
const EM_REGEX = /<em>(.*?)<\/em>/gi;
const ALL_HTML_TAGS_REGEX = /<[^>]*>/g;
const BR_REGEX = /<br\s*\/?>/gi;

interface RichTextSegment {
  type: 'text';
  plain_text: string;
  text: { content: string };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: 'default';
  };
}

interface ParagraphBlock {
  type: 'paragraph';
  paragraph: {
    rich_text: RichTextSegment[];
  };
}

interface ToggleHeading3Block {
  type: 'heading_3';
  heading_3: {
    rich_text: RichTextSegment[];
    is_toggleable: true;
    children: ParagraphBlock[];
  };
}

export interface DeckPage {
  title: string;
  children: ToggleHeading3Block[];
  subDecks: DeckPage[];
}

export interface TransformResult {
  deckPages: DeckPage[];
  totalNotes: number;
}

export class NoteTooLargeError extends Error {
  constructor(count: number) {
    super(
      `This deck has ${count} notes. Import supports up to ${MAX_NOTES} notes — it is too large to import.`
    );
    this.name = 'NoteTooLargeError';
  }
}

function stripMediaRefs(html: string): string {
  let result = html.replace(IMG_TAG_REGEX, '');
  result = result.replace(SOUND_TAG_REGEX, '');
  return result;
}

function stripClozeMarkers(text: string): string {
  return text.replace(CLOZE_REGEX, '$1');
}

function makeRichText(content: string, bold = false, italic = false): RichTextSegment {
  return {
    type: 'text',
    plain_text: content,
    text: { content },
    annotations: {
      bold,
      italic,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default',
    },
  };
}

function parseHtmlToRichText(html: string): RichTextSegment[] {
  const cleaned = stripMediaRefs(html);
  const withNewlines = cleaned.replace(BR_REGEX, '\n');

  const segments: RichTextSegment[] = [];
  let remaining = withNewlines;

  const tagPattern = /<(b|strong|i|em)>(.*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  const allMatches: Array<{ index: number; end: number; text: string; bold: boolean; italic: boolean }> = [];

  while ((match = tagPattern.exec(withNewlines)) !== null) {
    const tag = match[1].toLowerCase();
    const innerText = match[2].replace(ALL_HTML_TAGS_REGEX, '');
    const isBold = tag === 'b' || tag === 'strong';
    const isItalic = tag === 'i' || tag === 'em';
    allMatches.push({
      index: match.index,
      end: match.index + match[0].length,
      text: innerText,
      bold: isBold,
      italic: isItalic,
    });
  }

  if (allMatches.length === 0) {
    const plain = withNewlines.replace(ALL_HTML_TAGS_REGEX, '').trim();
    if (plain.length > 0) {
      segments.push(makeRichText(plain));
    }
    return segments;
  }

  for (const m of allMatches) {
    const before = withNewlines.slice(lastIndex, m.index).replace(ALL_HTML_TAGS_REGEX, '');
    if (before.length > 0) {
      segments.push(makeRichText(before));
    }
    if (m.text.length > 0) {
      segments.push(makeRichText(m.text, m.bold, m.italic));
    }
    lastIndex = m.end;
  }

  const after = withNewlines.slice(lastIndex).replace(ALL_HTML_TAGS_REGEX, '');
  if (after.length > 0) {
    segments.push(makeRichText(after));
  }

  return segments;
}

function makeParagraph(richText: RichTextSegment[]): ParagraphBlock {
  return {
    type: 'paragraph',
    paragraph: { rich_text: richText },
  };
}

function noteToToggle(
  note: Note,
  noteType: NoteType
): ToggleHeading3Block {
  const isCloze = noteType.type === 1;
  const frontField = note.fields[0] ?? '';
  const backFields = note.fields.slice(1);

  let summaryText = stripMediaRefs(frontField);
  if (isCloze) {
    summaryText = stripClozeMarkers(summaryText);
  }
  const summaryPlain = summaryText.replace(ALL_HTML_TAGS_REGEX, '').trim();
  const summaryRichText = [makeRichText(summaryPlain || 'Untitled')];

  const children: ParagraphBlock[] = [];

  for (const field of backFields) {
    const stripped = stripMediaRefs(field);
    if (stripped.replace(ALL_HTML_TAGS_REGEX, '').trim().length === 0) continue;

    if (isCloze) {
      const clozeText = stripMediaRefs(note.fields[0] ?? '');
      const segments = parseClozeToRichText(clozeText);
      if (segments.length > 0) {
        children.push(makeParagraph(segments));
      }
    } else {
      const segments = parseHtmlToRichText(stripped);
      if (segments.length > 0) {
        children.push(makeParagraph(segments));
      }
    }
  }

  if (children.length === 0 && backFields.length === 0) {
    if (isCloze) {
      const clozeText = stripMediaRefs(note.fields[0] ?? '');
      const segments = parseClozeToRichText(clozeText);
      if (segments.length > 0) {
        children.push(makeParagraph(segments));
      }
    }
  }

  if (children.length === 0) {
    children.push(makeParagraph([makeRichText(' ')]));
  }

  const tags = note.tags.trim();
  if (tags.length > 0) {
    const tagText = tags
      .split(/\s+/)
      .filter((t) => t.length > 0)
      .map((t) => `#${t}`)
      .join(' ');
    children.push(makeParagraph([makeRichText(tagText, false, true)]));
  }

  return {
    type: 'heading_3',
    heading_3: {
      rich_text: summaryRichText,
      is_toggleable: true,
      children,
    },
  };
}

function parseClozeToRichText(html: string): RichTextSegment[] {
  const cleaned = html.replace(ALL_HTML_TAGS_REGEX, '');
  const segments: RichTextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = /\{\{c\d+::(.*?)(?:::.*?)?\}\}/g;

  while ((match = regex.exec(cleaned)) !== null) {
    const before = cleaned.slice(lastIndex, match.index);
    if (before.length > 0) {
      segments.push(makeRichText(before));
    }
    segments.push(makeRichText(match[1], true, false));
    lastIndex = match.index + match[0].length;
  }

  const after = cleaned.slice(lastIndex);
  if (after.length > 0) {
    segments.push(makeRichText(after));
  }

  return segments;
}

interface DeckNode {
  name: string;
  fullName: string;
  id: number;
  children: Map<string, DeckNode>;
  notes: Array<{ note: Note; noteType: NoteType }>;
}

function buildDeckTree(
  collection: NormalizedCollection
): Map<string, DeckNode> {
  const deckNodes = new Map<string, DeckNode>();

  for (const [, deck] of collection.decks) {
    const parts = deck.name.split('::');
    let currentMap = deckNodes;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}::${part}` : part;

      if (!currentMap.has(part)) {
        currentMap.set(part, {
          name: part,
          fullName: currentPath,
          id: i === parts.length - 1 ? deck.id : -1,
          children: new Map(),
          notes: [],
        });
      }
      const node = currentMap.get(part)!;
      if (i === parts.length - 1) {
        node.id = deck.id;
      }
      currentMap = node.children;
    }
  }

  const notesByDeckId = new Map<number, Array<{ note: Note; noteType: NoteType }>>();
  const seenNotes = new Set<number>();

  for (const card of collection.cards) {
    if (seenNotes.has(card.nid)) continue;
    seenNotes.add(card.nid);

    const note = collection.notes.get(card.nid);
    if (note == null) continue;
    const noteType = collection.noteTypes.get(note.mid);
    if (noteType == null) continue;

    const existing = notesByDeckId.get(card.did) ?? [];
    existing.push({ note, noteType });
    notesByDeckId.set(card.did, existing);
  }

  function assignNotes(nodes: Map<string, DeckNode>) {
    for (const [, node] of nodes) {
      const notesForDeck = notesByDeckId.get(node.id);
      if (notesForDeck) {
        node.notes = notesForDeck;
      }
      assignNotes(node.children);
    }
  }

  assignNotes(deckNodes);
  return deckNodes;
}

function deckNodeToDeckPage(node: DeckNode): DeckPage {
  const children: ToggleHeading3Block[] = node.notes.map(({ note, noteType }) =>
    noteToToggle(note, noteType)
  );

  const subDecks: DeckPage[] = [];
  for (const [, child] of node.children) {
    subDecks.push(deckNodeToDeckPage(child));
  }

  return {
    title: node.name,
    children,
    subDecks,
  };
}

export default class ApkgToNotionBlocksService {
  transform(collection: NormalizedCollection): TransformResult {
    const seenNotes = new Set<number>();
    for (const card of collection.cards) {
      seenNotes.add(card.nid);
    }
    const totalNotes = seenNotes.size;

    if (totalNotes > MAX_NOTES) {
      throw new NoteTooLargeError(totalNotes);
    }

    const tree = buildDeckTree(collection);
    const deckPages: DeckPage[] = [];

    for (const [, node] of tree) {
      deckPages.push(deckNodeToDeckPage(node));
    }

    return { deckPages, totalNotes };
  }
}
