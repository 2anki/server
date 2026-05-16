import { getOfficialTemplates } from './officialTemplates';

describe('getOfficialTemplates', () => {
  const templates = getOfficialTemplates();

  it('returns every documented official template', () => {
    expect(templates.length).toBeGreaterThanOrEqual(10);
    const ids = templates.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'official-n2a-basic',
        'official-n2a-cloze',
        'official-n2a-input',
        'official-n2a-io',
        'official-only-notion-basic',
        'official-only-notion-cloze',
        'official-no-style-basic',
        'official-abhiyan-basic',
        'official-abhiyan-cloze',
        'official-alex-deluxe-basic',
        'official-alex-deluxe-cloze',
      ])
    );
  });

  it('shapes each entry as a NoteTypeStarter', () => {
    for (const template of templates) {
      expect(template).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        baseType: expect.any(String),
        noteType: {
          name: expect.any(String),
          tmpls: expect.any(Array),
          flds: expect.any(Array),
          css: expect.any(String),
        },
        previewData: expect.any(Object),
        tags: expect.any(Array),
      });
      expect(template.noteType.tmpls.length).toBeGreaterThan(0);
      expect(template.noteType.flds.length).toBeGreaterThan(0);
    }
  });

  it('marks the cloze and image-occlusion templates as cloze type', () => {
    const cloze = templates.find((t) => t.id === 'official-n2a-cloze');
    const io = templates.find((t) => t.id === 'official-n2a-io');
    expect(cloze?.noteType.type).toBe(1);
    expect(io?.noteType.type).toBe(1);
  });

  it('keeps the Anki template HTML in qfmt/afmt', () => {
    const basic = templates.find((t) => t.id === 'official-n2a-basic');
    expect(basic?.noteType.tmpls[0].qfmt).toContain('{{Front}}');
    expect(basic?.noteType.tmpls[0].afmt).toContain('{{Back}}');
  });

  it('returns the Raw Note variant with an empty CSS string', () => {
    const raw = templates.find((t) => t.id === 'official-no-style-basic');
    expect(raw?.noteType.css).toBe('');
  });

  it('only references fields that exist on the note type', () => {
    const ankiBuiltinTokens = new Set(['FrontSide']);
    const failures: string[] = [];
    for (const template of templates) {
      const declared = new Set(template.noteType.flds.map((f) => f.name));
      for (const tmpl of template.noteType.tmpls) {
        for (const ref of extractFieldRefs(tmpl.qfmt + tmpl.afmt)) {
          if (ankiBuiltinTokens.has(ref)) continue;
          if (declared.has(ref)) continue;
          failures.push(
            `${template.id}: references {{${ref}}} but flds are [${[...declared].join(', ')}]`,
          );
        }
      }
    }
    expect(failures).toEqual([]);
  });
});

function extractFieldRefs(html: string): string[] {
  const refs: string[] = [];
  const tokenPattern = /\{\{([^{}]+)\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(html)) !== null) {
    let name = match[1].trim();
    if (name.startsWith('#') || name.startsWith('/') || name.startsWith('^')) {
      name = name.slice(1).trim();
    }
    const colonIdx = name.indexOf(':');
    if (colonIdx !== -1) {
      name = name.slice(colonIdx + 1).trim();
    }
    if (name === '') continue;
    refs.push(name);
  }
  return refs;
}
