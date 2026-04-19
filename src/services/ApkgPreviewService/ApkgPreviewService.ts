import { extractApkg, parseMediaManifest } from './extractApkg';
import { parseCollection } from './parseCollection';
import {
  buildFieldMap,
  renderTemplate,
  TemplateSpecials,
} from './renderTemplate';
import { sanitizeCardHtml, sanitizeCss } from './sanitize';
import {
  NormalizedCollection,
  PreviewMeta,
  RenderedCard,
} from './types';

const MAX_CACHE_ENTRIES = 8;
const CACHE_TTL_MS = 10 * 60 * 1000;

interface ParsedApkg {
  collection: NormalizedCollection;
  mediaMap: Map<string, string>;
  parsedAt: number;
}

export default class ApkgPreviewService {
  private readonly cache = new Map<string, ParsedApkg>();

  async parse(cacheKey: string, bytes: Buffer): Promise<ParsedApkg> {
    const existing = this.cache.get(cacheKey);
    if (existing && Date.now() - existing.parsedAt < CACHE_TTL_MS) {
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, existing);
      return existing;
    }
    const archive = await extractApkg(bytes);
    const collection = parseCollection(archive.collectionBuffer);
    const mediaMap = parseMediaManifest(archive.mediaManifestRaw);
    const parsed: ParsedApkg = {
      collection,
      mediaMap,
      parsedAt: Date.now(),
    };
    this.cache.set(cacheKey, parsed);
    while (this.cache.size > MAX_CACHE_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (!oldestKey) break;
      this.cache.delete(oldestKey);
    }
    return parsed;
  }

  getMeta(parsed: ParsedApkg): PreviewMeta {
    const deckNames = Array.from(parsed.collection.decks.values())
      .map((deck) => deck.name)
      .sort((a, b) => a.localeCompare(b));
    return {
      totalCards: parsed.collection.cards.length,
      deckNames,
    };
  }

  getCardsPage(
    parsed: ParsedApkg,
    cursor: number,
    pageSize: number
  ): { cards: RenderedCard[]; nextCursor: number | null; total: number } {
    const all = parsed.collection.cards;
    const end = Math.min(all.length, cursor + pageSize);
    const slice = all.slice(cursor, end);
    const cards: RenderedCard[] = [];
    for (const card of slice) {
      const rendered = this.renderCard(parsed, card.id);
      if (rendered) cards.push(rendered);
    }
    return {
      cards,
      nextCursor: end < all.length ? end : null,
      total: all.length,
    };
  }

  private renderCard(
    parsed: ParsedApkg,
    cardId: number
  ): RenderedCard | null {
    const card = parsed.collection.cards.find((c) => c.id === cardId);
    if (!card) return null;
    const note = parsed.collection.notes.get(card.nid);
    if (!note) return null;
    const noteType = parsed.collection.noteTypes.get(note.mid);
    if (!noteType) return null;
    const template = noteType.templates.find((t) => t.ord === card.ord);
    if (!template) return null;
    const deck = parsed.collection.decks.get(card.did);

    const fieldMap = buildFieldMap(note.fields, noteType);
    const specials: TemplateSpecials = {
      Tags: note.tags.trim(),
      Type: noteType.name,
      Deck: deck?.name ?? '',
      Subdeck: deck?.name.split('::').pop() ?? '',
      Card: template.name,
    };

    const front = renderTemplate(template.qfmt, fieldMap, specials);
    const back = renderTemplate(template.afmt, fieldMap, {
      ...specials,
      FrontSide: front,
    });

    return {
      id: card.id,
      ord: card.ord,
      templateName: template.name,
      deckName: deck?.name ?? '',
      noteTypeName: noteType.name,
      css: sanitizeCss(noteType.css),
      front: sanitizeCardHtml(front),
      back: sanitizeCardHtml(back),
    };
  }
}
