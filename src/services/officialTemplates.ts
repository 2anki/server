import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

interface RawJsonTemplate {
  parent: string;
  name: string;
  front: string;
  back: string;
  fields: Array<{ name: string }>;
  styling: string;
}

interface OfficialStarter {
  id: string;
  name: string;
  description: string;
  baseType: string;
  noteType: {
    id: number;
    name: string;
    type: number;
    tmpls: Array<{
      name: string;
      ord: number;
      qfmt: string;
      afmt: string;
    }>;
    flds: Array<{ name: string; ord: number }>;
    css: string;
  };
  previewData: Record<string, string>;
  tags: string[];
}

function readText(filename: string): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf8');
}

function safeRead(filename: string): string | null {
  try {
    return readText(filename);
  } catch {
    return null;
  }
}

const STABLE_ID_BASE = Date.parse('2026-01-01');
let idOffset = 0;
function nextNoteTypeId(): number {
  idOffset += 1;
  return STABLE_ID_BASE + idOffset;
}

function jsonStarter(
  file: string,
  id: string,
  name: string,
  description: string,
  baseType: string,
  ankiType: number,
  previewData: Record<string, string>,
  tags: string[]
): OfficialStarter | null {
  const text = safeRead(file);
  if (text == null) return null;
  let raw: RawJsonTemplate;
  try {
    raw = JSON.parse(text) as RawJsonTemplate;
  } catch {
    return null;
  }
  return {
    id,
    name,
    description,
    baseType,
    noteType: {
      id: nextNoteTypeId(),
      name: raw.name ?? name,
      type: ankiType,
      tmpls: [
        {
          name: raw.parent ?? 'Card 1',
          ord: 0,
          qfmt: raw.front,
          afmt: raw.back,
        },
      ],
      flds: raw.fields.map((f, i) => ({ name: f.name, ord: i })),
      css: raw.styling,
    },
    previewData,
    tags,
  };
}

interface VariantSpec {
  id: string;
  name: string;
  description: string;
  baseType: string;
  ankiType: number;
  qfmtFile: string;
  afmtFile: string;
  cssFile: string;
  flds: Array<{ name: string; ord: number }>;
  previewData: Record<string, string>;
  tags: string[];
  modelName?: string;
}

function variantStarter(spec: VariantSpec): OfficialStarter | null {
  const qfmt = safeRead(spec.qfmtFile);
  const afmt = safeRead(spec.afmtFile);
  const css = safeRead(spec.cssFile);
  if (qfmt == null || afmt == null || css == null) return null;
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    baseType: spec.baseType,
    noteType: {
      id: nextNoteTypeId(),
      name: spec.modelName ?? spec.name,
      type: spec.ankiType,
      tmpls: [{ name: 'Card 1', ord: 0, qfmt, afmt }],
      flds: spec.flds,
      css,
    },
    previewData: spec.previewData,
    tags: spec.tags,
  };
}

interface StyledJsonSpec {
  id: string;
  name: string;
  description: string;
  baseType: string;
  ankiType: number;
  jsonFile: string;
  cssFile: string | null;
  previewData: Record<string, string>;
  tags: string[];
}

function styledFromJson(spec: StyledJsonSpec): OfficialStarter | null {
  const text = safeRead(spec.jsonFile);
  if (text == null) return null;
  let raw: RawJsonTemplate;
  try {
    raw = JSON.parse(text) as RawJsonTemplate;
  } catch {
    return null;
  }
  const css = spec.cssFile == null ? '' : (safeRead(spec.cssFile) ?? '');
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    baseType: spec.baseType,
    noteType: {
      id: nextNoteTypeId(),
      name: spec.name,
      type: spec.ankiType,
      tmpls: [
        {
          name: raw.parent ?? 'Card 1',
          ord: 0,
          qfmt: raw.front,
          afmt: raw.back,
        },
      ],
      flds: raw.fields.map((f, i) => ({ name: f.name, ord: i })),
      css,
    },
    previewData: spec.previewData,
    tags: spec.tags,
  };
}

const BASIC_PREVIEW = {
  Front: 'What is the capital of France?',
  Back: 'Paris',
  MyMedia: '',
};

const CLOZE_PREVIEW = {
  Text: 'The capital of {{c1::France}} is {{c2::Paris}}',
  Extra: 'European geography',
  MyMedia: '',
};

const ABHIYAN_BASIC_FLDS = [
  { name: 'Front', ord: 0 },
  { name: 'Back', ord: 1 },
  { name: 'Tags', ord: 2 },
];

const ABHIYAN_CLOZE_FLDS = [
  { name: 'Text', ord: 0 },
  { name: 'Extra', ord: 1 },
  { name: 'Tags', ord: 2 },
];

const ALEX_BASIC_FLDS = [
  { name: 'Front', ord: 0 },
  { name: 'Back', ord: 1 },
];

const ALEX_CLOZE_FLDS = [
  { name: 'Text', ord: 0 },
  { name: 'Extra', ord: 1 },
];

export function getOfficialTemplates(): OfficialStarter[] {
  idOffset = 0;
  const starters: Array<OfficialStarter | null> = [
    jsonStarter(
      'n2a-basic.json',
      'official-n2a-basic',
      'Default (Basic)',
      'The classic 2anki look — Notion-styled basic note type, used by every standard conversion',
      'basic',
      0,
      BASIC_PREVIEW,
      ['default', 'basic', 'notion']
    ),
    jsonStarter(
      'n2a-cloze.json',
      'official-n2a-cloze',
      'Default (Cloze)',
      'Cloze deletion that matches the standard 2anki conversion output',
      'cloze',
      1,
      CLOZE_PREVIEW,
      ['default', 'cloze', 'notion']
    ),
    jsonStarter(
      'n2a-input.json',
      'official-n2a-input',
      'Default (Type the answer)',
      'Type-in-the-answer note type from the 2anki conversion pipeline',
      'basic',
      0,
      {
        Front: 'Capital of France?',
        Back: 'Paris',
        Input: 'Paris',
        MyMedia: '',
      },
      ['default', 'input', 'type-the-answer']
    ),
    jsonStarter(
      'n2a-io.json',
      'official-n2a-io',
      'Image Occlusion',
      "Anki's image-occlusion note type, kept in sync with the 2anki conversion target",
      'cloze',
      1,
      {
        Header: 'Cell anatomy',
        Image: '',
        Occlusion: '{{c1::Nucleus}}',
        'Back Extra': 'Mitochondria is the powerhouse of the cell.',
        Comments: '',
      },
      ['image-occlusion']
    ),
    styledFromJson({
      id: 'official-only-notion-basic',
      name: 'Only Notion (Basic)',
      description: 'Notion-flavoured CSS only — strips the 2anki additions for a minimal Notion-native look',
      baseType: 'basic',
      ankiType: 0,
      jsonFile: 'n2a-basic.json',
      cssFile: 'notion.css',
      previewData: BASIC_PREVIEW,
      tags: ['notionstyle', 'notion'],
    }),
    styledFromJson({
      id: 'official-only-notion-cloze',
      name: 'Only Notion (Cloze)',
      description: 'Notion-only styling on the cloze base type',
      baseType: 'cloze',
      ankiType: 1,
      jsonFile: 'n2a-cloze.json',
      cssFile: 'notion.css',
      previewData: CLOZE_PREVIEW,
      tags: ['notionstyle', 'notion', 'cloze'],
    }),
    styledFromJson({
      id: 'official-no-style-basic',
      name: 'Raw Note (no style)',
      description: 'The bare note structure with no CSS applied — handy if you want to style it yourself',
      baseType: 'basic',
      ankiType: 0,
      jsonFile: 'n2a-basic.json',
      cssFile: null,
      previewData: BASIC_PREVIEW,
      tags: ['nostyle'],
    }),
    variantStarter({
      id: 'official-abhiyan-basic',
      name: 'Abhiyan Bhandari (Night Mode)',
      description: 'Dark, high-contrast Night Mode template by Abhiyan Bhandari',
      baseType: 'basic',
      ankiType: 0,
      qfmtFile: 'abhiyan_basic_front.html',
      afmtFile: 'abhiyan_basic_back.html',
      cssFile: 'abhiyan.css',
      flds: ABHIYAN_BASIC_FLDS,
      previewData: {
        Front: 'What is the capital of France?',
        Back: 'Paris',
        Tags: '',
      },
      tags: ['abhiyan', 'night-mode'],
      modelName: 'Abhiyan Basic',
    }),
    variantStarter({
      id: 'official-abhiyan-cloze',
      name: 'Abhiyan Bhandari (Night Mode — Cloze)',
      description: 'Night Mode applied to cloze deletions',
      baseType: 'cloze',
      ankiType: 1,
      qfmtFile: 'abhiyan_cloze_front.html',
      afmtFile: 'abhiyan_cloze_back.html',
      cssFile: 'abhiyan_cloze_style.css',
      flds: ABHIYAN_CLOZE_FLDS,
      previewData: {
        Text: 'The capital of {{c1::France}} is {{c2::Paris}}',
        Extra: 'European geography',
        Tags: '',
      },
      tags: ['abhiyan', 'night-mode', 'cloze'],
      modelName: 'Abhiyan Cloze',
    }),
    variantStarter({
      id: 'official-alex-deluxe-basic',
      name: 'Alexander Deluxe (Blue)',
      description: 'A blue, deluxe basic template by Alexander',
      baseType: 'basic',
      ankiType: 0,
      qfmtFile: 'alex_deluxe_basic_front.html',
      afmtFile: 'alex_deluxe_basic_back.html',
      cssFile: 'alex_deluxe.css',
      flds: ALEX_BASIC_FLDS,
      previewData: { Front: 'What is the capital of France?', Back: 'Paris' },
      tags: ['alex_deluxe', 'blue'],
      modelName: 'Alex Deluxe Basic',
    }),
    variantStarter({
      id: 'official-alex-deluxe-cloze',
      name: 'Alexander Deluxe (Blue — Cloze)',
      description: 'Cloze variant of the Alexander Deluxe template',
      baseType: 'cloze',
      ankiType: 1,
      qfmtFile: 'alex_deluxe_cloze_front.html',
      afmtFile: 'alex_deluxe_cloze_back.html',
      cssFile: 'alex_deluxe_cloze_style.css',
      flds: ALEX_CLOZE_FLDS,
      previewData: {
        Text: 'The capital of {{c1::France}} is {{c2::Paris}}',
        Extra: 'European geography',
      },
      tags: ['alex_deluxe', 'blue', 'cloze'],
      modelName: 'Alex Deluxe Cloze',
    }),
  ];

  return starters.filter((s): s is OfficialStarter => s !== null);
}
