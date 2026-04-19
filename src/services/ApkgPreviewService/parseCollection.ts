import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  Card,
  Deck,
  NormalizedCollection,
  Note,
  NoteType,
  NoteTypeField,
  NoteTypeTemplate,
} from './types';

interface LegacyModelJson {
  id: number | string;
  name: string;
  type?: number;
  css?: string;
  flds: Array<{ name: string; ord: number }>;
  tmpls: Array<{ name: string; ord: number; qfmt: string; afmt: string }>;
}

interface LegacyDeckJson {
  id: number | string;
  name: string;
}

function writeTempDb(buffer: Buffer): string {
  const tempPath = path.join(
    os.tmpdir(),
    `apkg-${Date.now()}-${crypto.randomUUID()}.sqlite`
  );
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}

function openCollection(buffer: Buffer): {
  db: Database.Database;
  cleanup: () => void;
} {
  const tempPath = writeTempDb(buffer);
  const db = new Database(tempPath, { readonly: true, fileMustExist: true });
  return {
    db,
    cleanup: () => {
      try {
        db.close();
      } finally {
        fs.unlinkSync(tempPath);
      }
    },
  };
}

function hasTable(db: Database.Database, table: string): boolean {
  const row = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
    )
    .get(table);
  return row != null;
}

function loadLegacyNoteTypes(db: Database.Database): Map<number, NoteType> {
  const row = db.prepare('SELECT models FROM col LIMIT 1').get() as
    | { models: string }
    | undefined;
  if (!row) return new Map();
  const parsed = JSON.parse(row.models) as Record<string, LegacyModelJson>;
  const map = new Map<number, NoteType>();
  for (const value of Object.values(parsed)) {
    const id = Number(value.id);
    map.set(id, {
      id,
      name: value.name,
      type: value.type === 1 ? 1 : 0,
      css: value.css ?? '',
      fields: value.flds.map(
        (field) => ({ name: field.name, ord: field.ord }) as NoteTypeField
      ),
      templates: value.tmpls.map(
        (tmpl) =>
          ({
            name: tmpl.name,
            ord: tmpl.ord,
            qfmt: tmpl.qfmt,
            afmt: tmpl.afmt,
          }) as NoteTypeTemplate
      ),
    });
  }
  return map;
}

function loadLegacyDecks(db: Database.Database): Map<number, Deck> {
  const row = db.prepare('SELECT decks FROM col LIMIT 1').get() as
    | { decks: string }
    | undefined;
  const map = new Map<number, Deck>();
  if (!row) return map;
  const parsed = JSON.parse(row.decks) as Record<string, LegacyDeckJson>;
  for (const value of Object.values(parsed)) {
    const id = Number(value.id);
    map.set(id, { id, name: value.name });
  }
  return map;
}

function loadModernNoteTypes(db: Database.Database): Map<number, NoteType> {
  const noteTypeRows = db
    .prepare('SELECT id, name, mtype, config FROM notetypes')
    .all() as Array<{
    id: number;
    name: string;
    mtype: number;
    config: Buffer;
  }>;
  const fieldRows = db
    .prepare(
      'SELECT ntid, name, ord FROM fields ORDER BY ntid, ord'
    )
    .all() as Array<{ ntid: number; name: string; ord: number }>;
  const templateRows = db
    .prepare(
      'SELECT ntid, name, ord, config FROM templates ORDER BY ntid, ord'
    )
    .all() as Array<{
    ntid: number;
    name: string;
    ord: number;
    config: Buffer;
  }>;

  const map = new Map<number, NoteType>();
  for (const row of noteTypeRows) {
    map.set(row.id, {
      id: row.id,
      name: row.name,
      type: row.mtype === 1 ? 1 : 0,
      css: '',
      fields: [],
      templates: [],
    });
  }
  for (const field of fieldRows) {
    map.get(field.ntid)?.fields.push({ name: field.name, ord: field.ord });
  }
  for (const tmpl of templateRows) {
    // The modern schema stores qfmt/afmt inside a protobuf-encoded `config`
    // blob. We don't decode protobuf here yet; surface a clear gap instead
    // of returning malformed templates.
    map.get(tmpl.ntid)?.templates.push({
      name: tmpl.name,
      ord: tmpl.ord,
      qfmt: '',
      afmt: '',
    });
  }
  return map;
}

function loadModernDecks(db: Database.Database): Map<number, Deck> {
  const rows = db.prepare('SELECT id, name FROM decks').all() as Array<{
    id: number;
    name: string;
  }>;
  const map = new Map<number, Deck>();
  for (const row of rows) {
    map.set(row.id, { id: row.id, name: row.name });
  }
  return map;
}

function loadNotes(db: Database.Database): Map<number, Note> {
  const rows = db
    .prepare('SELECT id, mid, tags, flds FROM notes')
    .all() as Array<{ id: number; mid: number; tags: string; flds: string }>;
  const map = new Map<number, Note>();
  for (const row of rows) {
    map.set(row.id, {
      id: row.id,
      mid: row.mid,
      tags: row.tags,
      fields: row.flds.split('\x1f'),
    });
  }
  return map;
}

function loadCards(db: Database.Database): Card[] {
  const rows = db
    .prepare('SELECT id, nid, did, ord FROM cards ORDER BY id')
    .all() as Array<{ id: number; nid: number; did: number; ord: number }>;
  return rows.map((row) => ({
    id: row.id,
    nid: row.nid,
    did: row.did,
    ord: row.ord,
  }));
}

export function parseCollection(buffer: Buffer): NormalizedCollection {
  const { db, cleanup } = openCollection(buffer);
  try {
    const modernSchema = hasTable(db, 'notetypes');
    const noteTypes = modernSchema
      ? loadModernNoteTypes(db)
      : loadLegacyNoteTypes(db);
    const decks = modernSchema ? loadModernDecks(db) : loadLegacyDecks(db);
    const notes = loadNotes(db);
    const cards = loadCards(db);
    return { noteTypes, notes, decks, cards };
  } finally {
    cleanup();
  }
}
