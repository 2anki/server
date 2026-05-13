import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveMeta, loadMeta } from './useOcclusionPersistence';
import { ImageEntry } from '../types';

function makeEntry(overrides: Partial<ImageEntry> = {}): ImageEntry {
  return {
    id: 'test-id-1',
    file: new File(['x'], 'img.jpg', { type: 'image/jpeg' }),
    header: 'Test header',
    rects: [],
    previewUrl: 'blob:fake-1', s3Key: null, uploading: false,
    ...overrides,
  };
}

describe('saveMeta / loadMeta round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing is stored', () => {
    expect(loadMeta()).toBeNull();
  });

  it('stores and restores deckName and mode', () => {
    saveMeta('My Deck', 'hide_one', []);
    const meta = loadMeta();
    expect(meta).toMatchObject({ deckName: 'My Deck', mode: 'hide_one', images: [] });
  });

  it('stores and restores image metadata without file or previewUrl', () => {
    const entry = makeEntry({
      id: 'abc-123',
      header: 'Chapter 1',
      rects: [{ id: 'r1', x: 0.1, y: 0.2, w: 0.3, h: 0.4, label: 'Label' }],
    });
    saveMeta('Deck', 'hide_all', [entry]);
    const meta = loadMeta();
    expect(meta?.images).toHaveLength(1);
    expect(meta?.images[0]).toMatchObject({
      id: 'abc-123',
      header: 'Chapter 1',
      rects: [{ id: 'r1', x: 0.1, y: 0.2, w: 0.3, h: 0.4, label: 'Label' }],
    });
  });

  it('overwrites previous save', () => {
    saveMeta('First', 'hide_all', []);
    saveMeta('Second', 'hide_one', [makeEntry()]);
    const meta = loadMeta();
    expect(meta?.deckName).toBe('Second');
    expect(meta?.images).toHaveLength(1);
  });

  it('returns null when stored value is not valid JSON', () => {
    localStorage.setItem('io_deck_meta', 'not-json{{{');
    expect(loadMeta()).toBeNull();
  });
});
