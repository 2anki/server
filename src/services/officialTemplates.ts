import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

interface RawOfficialTemplate {
  parent: string;
  name: string;
  storageKey: string;
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

interface OfficialDescriptor {
  file: string;
  id: string;
  name: string;
  description: string;
  baseType: string;
  ankiType: number;
  previewData: Record<string, string>;
  tags: string[];
}

const OFFICIAL_DESCRIPTORS: OfficialDescriptor[] = [
  {
    file: 'n2a-basic.json',
    id: 'official-n2a-basic',
    name: 'Notion Basic',
    description: 'Classic Notion-styled basic note type used by 2anki conversions',
    baseType: 'basic',
    ankiType: 0,
    previewData: {
      Front: 'What is the capital of France?',
      Back: 'Paris',
      MyMedia: '',
    },
    tags: ['notion', 'basic'],
  },
  {
    file: 'n2a-cloze.json',
    id: 'official-n2a-cloze',
    name: 'Notion Cloze',
    description: 'Cloze deletion template that mirrors the 2anki conversion output',
    baseType: 'cloze',
    ankiType: 1,
    previewData: {
      Text: 'The capital of {{c1::France}} is {{c2::Paris}}',
      Extra: 'European geography',
      MyMedia: '',
    },
    tags: ['notion', 'cloze'],
  },
  {
    file: 'n2a-input.json',
    id: 'official-n2a-input',
    name: 'Notion Input',
    description: 'Type the answer — a typed-input note type used by 2anki conversions',
    baseType: 'basic',
    ankiType: 0,
    previewData: {
      Front: 'Capital of France?',
      Back: 'Paris',
      Input: 'Paris',
      MyMedia: '',
    },
    tags: ['notion', 'input', 'type-the-answer'],
  },
  {
    file: 'n2a-io.json',
    id: 'official-n2a-io',
    name: 'Image Occlusion',
    description: "Anki's image-occlusion note type, kept in sync with the 2anki conversion target",
    baseType: 'cloze',
    ankiType: 1,
    previewData: {
      Header: 'Cell anatomy',
      Image: '',
      Occlusion: '{{c1::Nucleus}}',
      'Back Extra': 'Mitochondria is the powerhouse of the cell.',
      Comments: '',
    },
    tags: ['notion', 'image-occlusion'],
  },
];

function loadOne(descriptor: OfficialDescriptor): OfficialStarter | null {
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(TEMPLATES_DIR, descriptor.file), 'utf8')
    ) as RawOfficialTemplate;
    return {
      id: descriptor.id,
      name: descriptor.name,
      description: descriptor.description,
      baseType: descriptor.baseType,
      noteType: {
        id: Date.parse('2026-01-01') + descriptor.id.length,
        name: raw.name,
        type: descriptor.ankiType,
        tmpls: [
          {
            name: raw.parent,
            ord: 0,
            qfmt: raw.front,
            afmt: raw.back,
          },
        ],
        flds: raw.fields.map((f, i) => ({ name: f.name, ord: i })),
        css: raw.styling,
      },
      previewData: descriptor.previewData,
      tags: descriptor.tags,
    };
  } catch {
    return null;
  }
}

export function getOfficialTemplates(): OfficialStarter[] {
  const starters: OfficialStarter[] = [];
  for (const descriptor of OFFICIAL_DESCRIPTORS) {
    const starter = loadOne(descriptor);
    if (starter) starters.push(starter);
  }
  return starters;
}
