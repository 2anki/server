import { describe, expect, it } from 'vitest';

import { AnkiNoteType } from '../../lib/backend/templates';
import { buildPreviewDocument, renderCardSide } from './renderNoteTypePreview';

const basic: AnkiNoteType = {
  id: 1,
  name: 'Basic',
  type: 0,
  tmpls: [
    {
      name: 'Card 1',
      ord: 0,
      qfmt: '{{Front}}',
      afmt: '{{FrontSide}}<hr>{{Back}}',
    },
  ],
  flds: [
    { name: 'Front', ord: 0 },
    { name: 'Back', ord: 1 },
  ],
  css: '.card { color: black; }',
};

const cloze: AnkiNoteType = {
  ...basic,
  type: 1,
  tmpls: [
    {
      name: 'Cloze',
      ord: 0,
      qfmt: '{{cloze:Text}}',
      afmt: '{{cloze:Text}}<br>{{Extra}}',
    },
  ],
  flds: [
    { name: 'Text', ord: 0 },
    { name: 'Extra', ord: 1 },
  ],
};

describe('renderCardSide', () => {
  it('substitutes simple {{Field}} placeholders on the front', () => {
    const result = renderCardSide(basic, { Front: 'Hello', Back: 'World' }, 'front');
    expect(result).toBe('Hello');
  });

  it('substitutes {{FrontSide}} on the back', () => {
    const result = renderCardSide(basic, { Front: 'Q', Back: 'A' }, 'back');
    expect(result).toContain('Q');
    expect(result).toContain('A');
    expect(result).not.toContain('{{FrontSide}}');
  });

  it('renders cloze placeholders on the front', () => {
    const result = renderCardSide(
      cloze,
      { Text: 'The capital of {{c1::France}} is {{c2::Paris}}', Extra: '' },
      'front'
    );
    expect(result).toContain('The capital of');
    expect(result).toContain('[&hellip;]');
    expect(result).not.toContain('France');
    expect(result).not.toContain('Paris');
  });

  it('reveals cloze answers on the back', () => {
    const result = renderCardSide(
      cloze,
      { Text: 'Capital of {{c1::France}}', Extra: '' },
      'back'
    );
    expect(result).toContain('France');
    expect(result).not.toContain('{{c1');
  });

  it('drops unknown fields silently', () => {
    const result = renderCardSide(basic, { Front: 'Q', Back: 'A' }, 'front');
    expect(result).not.toContain('{{');
  });

  it('returns an empty string when the note type has no templates', () => {
    const empty: AnkiNoteType = { ...basic, tmpls: [] };
    expect(renderCardSide(empty, {}, 'front')).toBe('');
  });
});

describe('buildPreviewDocument', () => {
  it('wraps the rendered side in a sandbox-friendly HTML document', () => {
    const doc = buildPreviewDocument(basic, { Front: 'Q', Back: 'A' }, 'front');
    expect(doc).toContain('<!doctype html>');
    expect(doc).toContain('<style>');
    expect(doc).toContain('.card { color: black; }');
    expect(doc).toContain('<div class="card">Q</div>');
  });
});
