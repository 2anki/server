interface AnkiField {
  name: string;
  ord: number;
  sticky: boolean;
  rtl: boolean;
  font: string;
  size: number;
}

interface AnkiCardType {
  name: string;
  ord: number;
  qfmt: string;
  afmt: string;
}

interface AnkiNoteType {
  id: number;
  name: string;
  type: number;
  mod: number;
  usn: number;
  sortf: number;
  tmpls: AnkiCardType[];
  flds: AnkiField[];
  css: string;
  tags: string[];
}

interface DefaultTemplate {
  id: string;
  name: string;
  description: string;
  baseType: string;
  noteType: AnkiNoteType;
  previewData: Record<string, string>;
  tags: string[];
}

function getBasicNoteType(): AnkiNoteType {
  return {
    id: 1000000000000,
    name: 'Basic',
    type: 0,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: '<div class="front">\n  <h1>{{Front}}</h1>\n</div>',
        afmt: '<div class="back">\n  <div class="question">{{Front}}</div>\n  <hr id="answer">\n  <div class="answer">{{Back}}</div>\n</div>',
      },
    ],
    flds: [
      { name: 'Front', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Back', ord: 1, sticky: false, rtl: false, font: 'Inter', size: 20 },
    ],
    css: `.card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 20px;
  text-align: center;
  color: #1f2937;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-repeat: no-repeat;
  min-height: 100vh;
  padding: 40px;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card > * {
  max-width: 600px;
  width: 100%;
}

.front h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.back {
  color: white;
}

.question {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  opacity: 0.8;
}

.answer {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 20px;
}

hr {
  border: none;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 20px 0;
  border-radius: 1px;
}`,
    tags: [],
  };
}

function getClozeNoteType(): AnkiNoteType {
  return {
    id: 1000000000001,
    name: 'Cloze',
    type: 1,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Cloze',
        ord: 0,
        qfmt: '<div class="cloze-question">\n  {{cloze:Text}}\n</div>',
        afmt: '<div class="cloze-answer">\n  {{cloze:Text}}\n  {{#Extra}}\n    <div class="extra">{{Extra}}</div>\n  {{/Extra}}\n</div>',
      },
    ],
    flds: [
      { name: 'Text', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Extra', ord: 1, sticky: false, rtl: false, font: 'Inter', size: 16 },
    ],
    css: `.card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 20px;
  text-align: center;
  color: #ffffff;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%);
  min-height: 100%;
  padding: 40px;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.cloze-question, .cloze-answer {
  color: #e2e8f0;
  line-height: 1.8;
  font-size: 1.3rem;
}

.cloze {
  font-weight: 700;
  background: rgba(99, 179, 237, 0.2);
  color: #63b3ed;
  padding: 4px 10px;
  border-radius: 6px;
  border-bottom: 2px solid #63b3ed;
}

.extra {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.75);
  border-left: 4px solid #63b3ed;
}`,
    tags: [],
  };
}

function getVocabNoteType(): AnkiNoteType {
  return {
    id: 1000000000010,
    name: 'Vocabulary',
    type: 0,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: `<div class="vocab-front">
  <div class="word">{{Word}}</div>
  <div class="reading">{{Reading}}</div>
</div>`,
        afmt: `<div class="vocab-back">
  <div class="word">{{Word}}</div>
  <div class="reading">{{Reading}}</div>
  <hr class="divider">
  <div class="meaning">{{Meaning}}</div>
  {{#Example}}
  <div class="example">
    <div class="example-sentence">{{Example}}</div>
    <div class="example-translation">{{ExampleTranslation}}</div>
  </div>
  {{/Example}}
</div>`,
      },
    ],
    flds: [
      { name: 'Word', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Reading', ord: 1, sticky: false, rtl: false, font: 'Inter', size: 16 },
      { name: 'Meaning', ord: 2, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Example', ord: 3, sticky: false, rtl: false, font: 'Inter', size: 16 },
      { name: 'ExampleTranslation', ord: 4, sticky: false, rtl: false, font: 'Inter', size: 16 },
    ],
    css: `.card {
  font-family: 'Noto Sans', 'Hiragino Sans', 'Yu Gothic', 'Inter', sans-serif;
  background: #fafaf9;
  min-height: 100%;
  margin: 0;
  padding: 32px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.vocab-front, .vocab-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.word {
  font-size: 2.8rem;
  font-weight: 700;
  color: #1c1917;
  line-height: 1.2;
  margin-bottom: 8px;
}

.reading {
  font-size: 1.1rem;
  color: #78716c;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.divider {
  border: none;
  height: 1px;
  background: #e7e5e4;
  margin: 24px auto;
  width: 60%;
}

.meaning {
  font-size: 1.3rem;
  color: #292524;
  font-weight: 500;
  margin-bottom: 20px;
}

.example {
  background: #f5f5f4;
  border-radius: 12px;
  padding: 16px 20px;
  border-left: 3px solid #a78bfa;
  text-align: left;
}

.example-sentence {
  font-size: 1rem;
  color: #1c1917;
  margin-bottom: 6px;
  line-height: 1.6;
}

.example-translation {
  font-size: 0.9rem;
  color: #78716c;
  font-style: italic;
}`,
    tags: [],
  };
}

function getMedicalNoteType(): AnkiNoteType {
  return {
    id: 1000000000011,
    name: 'Medical Term',
    type: 0,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: `<div class="medical-front">
  <div class="label">Define</div>
  <div class="term">{{Term}}</div>
</div>`,
        afmt: `<div class="medical-back">
  <div class="term-small">{{Term}}</div>
  <div class="definition">{{Definition}}</div>
  {{#Mnemonic}}
  <div class="mnemonic">
    <span class="mnemonic-label">Mnemonic</span>
    {{Mnemonic}}
  </div>
  {{/Mnemonic}}
</div>`,
      },
    ],
    flds: [
      { name: 'Term', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Definition', ord: 1, sticky: false, rtl: false, font: 'Inter', size: 16 },
      { name: 'Mnemonic', ord: 2, sticky: false, rtl: false, font: 'Inter', size: 16 },
      { name: 'Image', ord: 3, sticky: false, rtl: false, font: 'Inter', size: 16 },
    ],
    css: `.card {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #f0f9ff;
  min-height: 100%;
  margin: 0;
  padding: 32px 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medical-front, .medical-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0284c7;
  margin-bottom: 12px;
}

.term {
  font-size: 2.2rem;
  font-weight: 700;
  color: #0c4a6e;
  line-height: 1.2;
}

.term-small {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0284c7;
  margin-bottom: 16px;
}

.definition {
  font-size: 1.1rem;
  color: #1e3a5f;
  line-height: 1.7;
  margin-bottom: 20px;
}

.mnemonic {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 0.95rem;
  color: #9a3412;
  line-height: 1.5;
  text-align: left;
}

.mnemonic-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c2410c;
  margin-bottom: 4px;
}`,
    tags: [],
  };
}

function getProgrammingNoteType(): AnkiNoteType {
  return {
    id: 1000000000012,
    name: 'Code Card',
    type: 0,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: `<div class="code-front">
  <div class="question">{{Question}}</div>
</div>`,
        afmt: `<div class="code-back">
  <div class="question-small">{{Question}}</div>
  <pre class="code-block"><code>{{Answer}}</code></pre>
  {{#Notes}}
  <div class="notes">{{Notes}}</div>
  {{/Notes}}
</div>`,
      },
    ],
    flds: [
      { name: 'Question', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Answer', ord: 1, sticky: false, rtl: false, font: 'Fira Code', size: 14 },
      { name: 'Notes', ord: 2, sticky: false, rtl: false, font: 'Inter', size: 14 },
    ],
    css: `.card {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100%;
  margin: 0;
  padding: 28px 20px;
  box-sizing: border-box;
}

.code-front, .code-back {
  max-width: 560px;
  margin: 0 auto;
}

.question {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.5;
  margin-bottom: 8px;
  text-align: center;
}

.question-small {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 16px;
  text-align: center;
}

.code-block {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
  margin: 0 0 16px;
  overflow-x: auto;
  text-align: left;
}

.code-block code {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #7dd3fc;
  white-space: pre;
  line-height: 1.7;
}

.notes {
  background: #1e293b;
  border-left: 3px solid #818cf8;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  font-size: 0.88rem;
  color: #cbd5e1;
  line-height: 1.6;
}`,
    tags: [],
  };
}

function getMinimalNoteType(): AnkiNoteType {
  return {
    id: 1000000000013,
    name: 'Minimal',
    type: 0,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: `<div class="minimal-front">
  <div class="question">{{Front}}</div>
</div>`,
        afmt: `<div class="minimal-back">
  <div class="question-repeat">{{Front}}</div>
  <div class="answer">{{Back}}</div>
</div>`,
      },
    ],
    flds: [
      { name: 'Front', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Back', ord: 1, sticky: false, rtl: false, font: 'Inter', size: 20 },
    ],
    css: `.card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #ffffff;
  min-height: 100%;
  margin: 0;
  padding: 40px 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.minimal-front, .minimal-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.question {
  font-size: 1.5rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.5;
}

.question-repeat {
  font-size: 1rem;
  color: #9ca3af;
  margin-bottom: 24px;
  line-height: 1.5;
}

.answer {
  font-size: 1.6rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}`,
    tags: [],
  };
}

function getQuoteNoteType(): AnkiNoteType {
  return {
    id: 1000000000014,
    name: 'Quote',
    type: 0,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: `<div class="quote-front">
  <div class="quotemark">"</div>
  <blockquote class="quote-text">{{Quote}}</blockquote>
</div>`,
        afmt: `<div class="quote-back">
  <div class="quotemark">"</div>
  <blockquote class="quote-text">{{Quote}}</blockquote>
  <div class="attribution">
    <span class="author">— {{Author}}</span>
    {{#Context}}<span class="context">{{Context}}</span>{{/Context}}
  </div>
</div>`,
      },
    ],
    flds: [
      { name: 'Quote', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Author', ord: 1, sticky: false, rtl: false, font: 'Inter', size: 16 },
      { name: 'Context', ord: 2, sticky: false, rtl: false, font: 'Inter', size: 14 },
    ],
    css: `.card {
  font-family: 'Georgia', 'Palatino', serif;
  background: #1c1917;
  min-height: 100%;
  margin: 0;
  padding: 40px 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote-front, .quote-back {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.quotemark {
  font-size: 6rem;
  line-height: 0.5;
  color: #a78bfa;
  margin-bottom: 16px;
  font-family: Georgia, serif;
}

.quote-text {
  font-size: 1.25rem;
  font-style: italic;
  color: #f5f5f4;
  line-height: 1.8;
  margin: 0 0 24px;
}

.attribution {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author {
  font-size: 1rem;
  font-weight: 600;
  color: #a78bfa;
  font-style: normal;
  font-family: 'Inter', sans-serif;
}

.context {
  font-size: 0.82rem;
  color: #78716c;
  font-style: normal;
  font-family: 'Inter', sans-serif;
}`,
    tags: [],
  };
}

function getMathNoteType(): AnkiNoteType {
  return {
    id: 1000000000015,
    name: 'Math Problem',
    type: 0,
    mod: 0,
    usn: -1,
    sortf: 0,
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: `<div class="math-front">
  <div class="label">Solve</div>
  <div class="problem">{{Problem}}</div>
</div>`,
        afmt: `<div class="math-back">
  <div class="problem-small">{{Problem}}</div>
  <div class="solution">{{Solution}}</div>
  {{#Steps}}
  <div class="steps">
    <div class="steps-label">How</div>
    {{Steps}}
  </div>
  {{/Steps}}
</div>`,
      },
    ],
    flds: [
      { name: 'Problem', ord: 0, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Solution', ord: 1, sticky: false, rtl: false, font: 'Inter', size: 20 },
      { name: 'Steps', ord: 2, sticky: false, rtl: false, font: 'Inter', size: 16 },
    ],
    css: `.card {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #fefce8;
  min-height: 100%;
  margin: 0;
  padding: 32px 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.math-front, .math-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ca8a04;
  margin-bottom: 12px;
}

.problem {
  font-size: 1.4rem;
  color: #1c1917;
  line-height: 1.5;
  font-weight: 500;
}

.problem-small {
  font-size: 0.95rem;
  color: #92400e;
  margin-bottom: 20px;
  line-height: 1.4;
}

.solution {
  font-size: 1.6rem;
  font-weight: 700;
  color: #15803d;
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.steps {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 0.9rem;
  color: #78350f;
  line-height: 1.7;
  text-align: left;
}

.steps-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #d97706;
  margin-bottom: 6px;
}`,
    tags: [],
  };
}

export function getDefaultTemplates(): DefaultTemplate[] {
  return [
    {
      id: 'basic-clean',
      name: 'Clean Basic',
      description: 'A minimal, clean basic note type',
      baseType: 'basic',
      noteType: getBasicNoteType(),
      previewData: { Front: 'What is the capital of France?', Back: 'Paris' },
      tags: ['basic', 'minimal'],
    },
    {
      id: 'cloze-modern',
      name: 'Modern Cloze',
      description: 'A stylish cloze deletion template',
      baseType: 'cloze',
      noteType: getClozeNoteType(),
      previewData: {
        Text: 'The capital of {{c1::France}} is {{c2::Paris}}.',
        Extra: 'France is located in Western Europe.',
      },
      tags: ['cloze', 'geography'],
    },
    {
      id: 'vocab-language',
      name: 'Vocabulary Card',
      description: 'Language learning — word, reading, meaning, example sentence',
      baseType: 'basic',
      noteType: getVocabNoteType(),
      previewData: {
        Word: '勉強',
        Reading: 'べんきょう',
        Meaning: 'study; to study',
        Example: '毎日日本語を勉強しています。',
        ExampleTranslation: 'I study Japanese every day.',
      },
      tags: ['language', 'vocabulary', 'japanese'],
    },
    {
      id: 'medical-term',
      name: 'Medical Term',
      description: 'Anatomy / medical — term, definition, mnemonic',
      baseType: 'basic',
      noteType: getMedicalNoteType(),
      previewData: {
        Term: 'Mitral Valve',
        Definition: 'The bicuspid valve between the left atrium and left ventricle of the heart',
        Mnemonic: 'MItral = left sIde (both have I)',
        Image: '',
      },
      tags: ['medical', 'anatomy'],
    },
    {
      id: 'programming-snippet',
      name: 'Code Card',
      description: 'Programming — question with code block answer',
      baseType: 'basic',
      noteType: getProgrammingNoteType(),
      previewData: {
        Question: 'How do you reverse a string in Python?',
        Answer: 's = "hello"\nreversed_s = s[::-1]\nprint(reversed_s)  # "olleh"',
        Notes: 'Slice notation [start:stop:step] with step -1 iterates backwards.',
      },
      tags: ['programming', 'python', 'code'],
    },
    {
      id: 'minimal-white',
      name: 'Minimal',
      description: 'Clean white card — distraction-free reading',
      baseType: 'basic',
      noteType: getMinimalNoteType(),
      previewData: {
        Front: 'What is the powerhouse of the cell?',
        Back: 'The mitochondria',
      },
      tags: ['minimal', 'clean'],
    },
    {
      id: 'quote-card',
      name: 'Quote',
      description: 'A large featured quote with author attribution',
      baseType: 'basic',
      noteType: getQuoteNoteType(),
      previewData: {
        Quote: 'The only way to do great work is to love what you do.',
        Author: 'Steve Jobs',
        Context: 'Stanford Commencement Address, 2005',
      },
      tags: ['quotes', 'inspiration'],
    },
    {
      id: 'math-problem',
      name: 'Math Problem',
      description: 'Problem and worked solution with LaTeX rendering via KaTeX',
      baseType: 'basic',
      noteType: getMathNoteType(),
      previewData: {
        Problem: 'Find the derivative of f(x) = x³ + 2x² − 5x + 1',
        Solution: "f'(x) = 3x² + 4x − 5",
        Steps: 'Apply the power rule: d/dx[xⁿ] = n·xⁿ⁻¹ to each term.',
      },
      tags: ['math', 'calculus'],
    },
  ];
}

export { getBasicNoteType, getClozeNoteType, getVocabNoteType, getMedicalNoteType, getProgrammingNoteType, getMinimalNoteType, getQuoteNoteType, getMathNoteType };
export type { DefaultTemplate, AnkiNoteType, AnkiField, AnkiCardType };
