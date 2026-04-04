import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require('sql.js') as typeof import('sql.js');
import { zipSync } from 'fflate';

interface AnkiCardType {
  name: string;
  ord: number;
  qfmt: string;
  afmt: string;
  bqfmt?: string;
  bafmt?: string;
}

interface AnkiField {
  name: string;
  ord: number;
}

interface AnkiNoteType {
  id: number;
  name: string;
  type: number;
  tmpls: AnkiCardType[];
  flds: AnkiField[];
  css: string;
}

function locateSqlWasm(filename: string): string {
  const wasmJsPath = require.resolve('sql.js/dist/sql-wasm.js');
  return path.join(path.dirname(wasmJsPath), filename);
}

export async function exportNoteTypeToApkg(noteType: AnkiNoteType): Promise<Buffer> {
  const SQL = await initSqlJs({ locateFile: locateSqlWasm });
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE col (id integer primary key, crt integer not null, mod integer not null, scm integer not null, ver integer not null, dty integer not null, usn integer not null, ls integer not null, conf text not null, models text not null, decks text not null, dconf text not null, tags text not null);
    CREATE TABLE notes (id integer primary key, guid text not null, mid integer not null, mod integer not null, usn integer not null, tags text not null, flds text not null, sfld integer not null, csum integer not null, flags integer not null, data text not null);
    CREATE TABLE cards (id integer primary key, nid integer not null, did integer not null, ord integer not null, mod integer not null, usn integer not null, type integer not null, queue integer not null, due integer not null, ivl integer not null, factor integer not null, reps integer not null, lapses integer not null, left integer not null, odue integer not null, odid integer not null, flags integer not null, data text not null);
    CREATE TABLE revlog (id integer primary key, cid integer not null, usn integer not null, ease integer not null, ivl integer not null, lastIvl integer not null, factor integer not null, time integer not null, type integer not null);
    CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
    CREATE INDEX ix_notes_usn on notes (usn);
    CREATE INDEX ix_cards_usn on cards (usn);
    CREATE INDEX ix_cards_nid on cards (nid);
    CREATE INDEX ix_cards_sched on cards (did, queue, due);
    CREATE INDEX ix_notes_csum on notes (csum);
  `);

  const now = Math.floor(Date.now() / 1000);
  const modelId = noteType.id || Date.now();
  const deckId = 1;

  const model = {
    [modelId]: {
      id: modelId,
      name: noteType.name,
      type: noteType.type || 0,
      mod: now,
      usn: -1,
      sortf: 0,
      did: null,
      tmpls: noteType.tmpls.map((t) => ({
        name: t.name,
        ord: t.ord,
        qfmt: t.qfmt,
        afmt: t.afmt,
        bqfmt: t.bqfmt || '',
        bafmt: t.bafmt || '',
        did: null,
        bfont: '',
        bsize: 0,
      })),
      flds: noteType.flds.map((f) => ({
        name: f.name,
        ord: f.ord,
        sticky: false,
        rtl: false,
        font: 'Arial',
        size: 20,
        description: '',
      })),
      css: noteType.css || '',
      latexPre:
        '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
      latexPost: '\\end{document}',
      latexsvg: false,
      req: noteType.tmpls.map((_, i) => [i, 'all', [0]]),
    },
  };

  const deck = {
    [deckId]: {
      id: deckId,
      name: 'Default',
      desc: '',
      conf: 1,
      extendRev: 50,
      usn: 0,
      collapsed: false,
      newToday: [0, 0],
      timeToday: [0, 0],
      dyn: 0,
      extendNew: 10,
      revToday: [0, 0],
      lrnToday: [0, 0],
      mod: now,
      browserCollapsed: false,
    },
  };

  const conf = {
    nextPos: 1,
    estTimes: true,
    activeDecks: [deckId],
    sortField: 0,
    timeLim: 0,
    htmlArs: false,
    activeCols: ['noteFld', 'template', 'cardDue', 'deck'],
    dueCounts: true,
    curModel: String(modelId),
    newBury: true,
    newSpread: 0,
    decks: 1,
    sortBackwards: false,
    addToCur: true,
  };

  const dconf = {
    '1': {
      id: 1,
      mod: now,
      name: 'Default',
      usn: -1,
      maxTaken: 60,
      autoplay: true,
      timer: 0,
      replayq: true,
      new: {
        delays: [1, 10],
        ints: [1, 4, 7],
        initialFactor: 2500,
        order: 1,
        perDay: 20,
        bury: false,
        separate: true,
      },
      lapse: { delays: [10], leechFails: 8, leechAction: 0, minInt: 1, mult: 0 },
      rev: {
        perDay: 200,
        ease4: 1.3,
        fuzz: 0.05,
        minSpace: 1,
        ivlFct: 1,
        maxIvl: 36500,
        bury: false,
        hardFactor: 1.2,
      },
    },
  };

  db.run('INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    1,
    now,
    now,
    now,
    11,
    0,
    -1,
    0,
    JSON.stringify(conf),
    JSON.stringify(model),
    JSON.stringify(deck),
    JSON.stringify(dconf),
    '{}',
  ]);

  const dbData = db.export();
  db.close();

  const zip = zipSync({
    'collection.anki2': dbData,
    media: new TextEncoder().encode('{}'),
  });

  return Buffer.from(zip);
}
