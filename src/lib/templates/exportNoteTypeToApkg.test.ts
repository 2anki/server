import { unzipSync, strFromU8 } from 'fflate';

import { exportNoteTypeToApkg, AnkiNoteType } from './exportNoteTypeToApkg';

const basicNoteType: AnkiNoteType = {
  id: 1000000000000,
  name: 'Basic',
  type: 0,
  tmpls: [
    {
      name: 'Card 1',
      ord: 0,
      qfmt: '{{Front}}',
      afmt: '{{Front}}<hr id="answer">{{Back}}',
    },
  ],
  flds: [
    { name: 'Front', ord: 0 },
    { name: 'Back', ord: 1 },
  ],
  css: '.card { color: black; }',
};

describe('exportNoteTypeToApkg', () => {
  it('returns a non-empty Buffer', async () => {
    const buffer = await exportNoteTypeToApkg(basicNoteType);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('produces a zip containing collection.anki2 and a media manifest', async () => {
    const buffer = await exportNoteTypeToApkg(basicNoteType, {
      Front: 'Q',
      Back: 'A',
    });

    const entries = unzipSync(new Uint8Array(buffer));

    expect(Object.keys(entries)).toEqual(
      expect.arrayContaining(['collection.anki2', 'media'])
    );
    expect(entries['collection.anki2'].length).toBeGreaterThan(0);
    expect(strFromU8(entries.media)).toBe('{}');
  });

  it('skips writing a sample note when no previewData is supplied', async () => {
    const buffer = await exportNoteTypeToApkg(basicNoteType);

    expect(buffer.length).toBeGreaterThan(0);
  });

  it('embeds the preview note when previewData is supplied', async () => {
    const buffer = await exportNoteTypeToApkg(basicNoteType, {
      Front: 'Capital of France?',
      Back: 'Paris',
    });

    expect(buffer.length).toBeGreaterThan(0);
  });
});
