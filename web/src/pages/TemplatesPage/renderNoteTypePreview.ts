import { AnkiNoteType } from '../../lib/backend/templates';

type PreviewData = Record<string, string>;

const CLOZE_FIELD_RE = /\{\{cloze:([\w-]+)\}\}/g;
const CLOZE_TOKEN_RE = /\{\{c\d+::([^}:]+)(?:::[^}]+)?\}\}/g;
const FIELD_RE = /\{\{([\w-]+)\}\}/g;

function renderClozeContent(value: string, side: 'front' | 'back'): string {
  return value.replace(CLOZE_TOKEN_RE, (_match, answer) => {
    if (side === 'front') return '<span class="cloze">[&hellip;]</span>';
    return `<span class="cloze">${answer}</span>`;
  });
}

function substituteFields(
  format: string,
  data: PreviewData,
  side: 'front' | 'back'
): string {
  const withCloze = format.replace(CLOZE_FIELD_RE, (_match, fieldName) =>
    renderClozeContent(data[fieldName] ?? '', side)
  );
  return withCloze.replace(FIELD_RE, (_match, fieldName) => data[fieldName] ?? '');
}

export function renderCardSide(
  noteType: AnkiNoteType,
  previewData: PreviewData,
  side: 'front' | 'back'
): string {
  const template = noteType.tmpls[0];
  if (!template) return '';
  if (side === 'front') {
    return substituteFields(template.qfmt, previewData, 'front');
  }
  const frontHtml = substituteFields(template.qfmt, previewData, 'front');
  const backWithFront = template.afmt.replaceAll('{{FrontSide}}', frontHtml);
  return substituteFields(backWithFront, previewData, 'back');
}

export function buildPreviewDocument(
  noteType: AnkiNoteType,
  previewData: PreviewData,
  side: 'front' | 'back'
): string {
  const body = renderCardSide(noteType, previewData, side);
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>
html, body { margin: 0; padding: 0; }
body { overflow: hidden; }
${noteType.css ?? ''}
</style></head><body><div class="card">${body}</div></body></html>`;
}
