import os from 'os';
import path from 'path';
import fs from 'fs';

import CustomExporter from './CustomExporter';
import { DeckTooLargeError } from './DeckTooLargeError';
import Deck from '../Deck';
import CardOption from '../Settings';

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'custom-exporter-test-'));
}

function emptySettings(): CardOption {
  return new CardOption({});
}

describe('CustomExporter.configure', () => {
  it('throws DeckTooLargeError when JSON.stringify throws a RangeError', () => {
    const dir = tempDir();
    const exporter = new CustomExporter('test-deck', dir);

    const originalStringify = JSON.stringify;
    JSON.stringify = () => {
      throw new RangeError('Invalid string length');
    };

    try {
      expect(() => exporter.configure([] as Deck[])).toThrow(DeckTooLargeError);
    } finally {
      JSON.stringify = originalStringify;
    }
  });

  it('re-throws non-RangeError exceptions from JSON.stringify unchanged', () => {
    const dir = tempDir();
    const exporter = new CustomExporter('test-deck', dir);

    const originalStringify = JSON.stringify;
    JSON.stringify = () => {
      throw new TypeError('unexpected');
    };

    try {
      expect(() => exporter.configure([] as Deck[])).toThrow(TypeError);
    } finally {
      JSON.stringify = originalStringify;
    }
  });

  it('writes deck_info.json when serialization succeeds', () => {
    const dir = tempDir();
    const exporter = new CustomExporter('test-deck', dir);
    const deck = new Deck('My Deck', [], '', '', 1234567890123456, emptySettings());

    exporter.configure([deck]);

    const written = fs.readFileSync(path.join(dir, 'deck_info.json'), 'utf8');
    const parsed = JSON.parse(written);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].name).toBe('My Deck');
  });
});
