import JSZip from 'jszip';
import Database from 'better-sqlite3';

import { extractApkg } from './extractApkg';
import { parseCollection } from './parseCollection';

function buildLegacyCollectionBuffer(): Buffer {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE col (
      id INTEGER PRIMARY KEY,
      crt INTEGER DEFAULT 0,
      mod INTEGER DEFAULT 0,
      scm INTEGER DEFAULT 0,
      ver INTEGER DEFAULT 0,
      dty INTEGER DEFAULT 0,
      usn INTEGER DEFAULT 0,
      ls INTEGER DEFAULT 0,
      conf TEXT DEFAULT '{}',
      models TEXT,
      decks TEXT,
      dconf TEXT DEFAULT '{}',
      tags TEXT DEFAULT '{}'
    );
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY,
      guid TEXT, mid INTEGER, mod INTEGER, usn INTEGER,
      tags TEXT, flds TEXT, sfld TEXT, csum INTEGER, flags INTEGER, data TEXT
    );
    CREATE TABLE cards (
      id INTEGER PRIMARY KEY,
      nid INTEGER, did INTEGER, ord INTEGER, mod INTEGER, usn INTEGER,
      type INTEGER, queue INTEGER, due INTEGER, ivl INTEGER, factor INTEGER,
      reps INTEGER, lapses INTEGER, left INTEGER, odue INTEGER, odid INTEGER,
      flags INTEGER, data TEXT
    );
  `);
  const models = {
    '1': {
      id: 1,
      name: 'Basic',
      type: 0,
      css: '.card{}',
      flds: [
        { name: 'Front', ord: 0 },
        { name: 'Back', ord: 1 },
      ],
      tmpls: [
        { name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' },
      ],
    },
  };
  const decks = { '2': { id: 2, name: 'Demo' } };
  db.prepare('INSERT INTO col (id, models, decks) VALUES (1, ?, ?)').run(
    JSON.stringify(models),
    JSON.stringify(decks)
  );
  db.prepare(
    "INSERT INTO notes (id, guid, mid, tags, flds, sfld) VALUES (10, 'g', 1, ' ', 'hello\x1fworld', 'hello')"
  ).run();
  db.prepare(
    'INSERT INTO cards (id, nid, did, ord) VALUES (100, 10, 2, 0)'
  ).run();
  const buf = Buffer.from(db.serialize());
  db.close();
  return buf;
}

async function buildApkgZip(
  collectionName: string,
  collectionBuffer: Buffer
): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(collectionName, collectionBuffer);
  zip.file('media', '{}');
  return zip.generateAsync({ type: 'nodebuffer' });
}

describe('extractApkg + parseCollection composition', () => {
  it('parses notes from a real .apkg zip wrapping a legacy collection.anki2', async () => {
    const apkg = await buildApkgZip('collection.anki2', buildLegacyCollectionBuffer());

    const archive = await extractApkg(apkg);
    const collection = parseCollection(archive.collectionBuffer);

    expect(archive.collectionName).toBe('collection.anki2');
    expect(collection.notes.size).toBe(1);
    expect(collection.notes.get(10)?.fields).toEqual(['hello', 'world']);
  });

  it('feeding the raw .apkg zip to parseCollection directly throws SQLITE_NOTADB (regression guard)', async () => {
    const apkg = await buildApkgZip('collection.anki2', buildLegacyCollectionBuffer());
    expect(() => parseCollection(apkg)).toThrow(/not a database/i);
  });

  it('rejects zstd-compressed Anki 23.10+ archives with a clear message', async () => {
    const apkg = await buildApkgZip(
      'collection.anki21b',
      Buffer.from('zstd-compressed-bytes-here')
    );
    await expect(extractApkg(apkg)).rejects.toThrow(/zstd-compressed/i);
  });
});
