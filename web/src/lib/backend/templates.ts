import { get, post } from './api';

export interface AnkiCardTemplate {
  name: string;
  ord: number;
  qfmt: string;
  afmt: string;
  bqfmt?: string;
  bafmt?: string;
}

export interface AnkiNoteField {
  name: string;
  ord: number;
}

export interface AnkiNoteType {
  id: number;
  name: string;
  type: number;
  tmpls: AnkiCardTemplate[];
  flds: AnkiNoteField[];
  css: string;
  tags?: string[];
}

export interface NoteTypeStarter {
  id: string;
  name: string;
  description: string;
  baseType: string;
  noteType: AnkiNoteType;
  previewData: Record<string, string>;
  tags: string[];
}

export async function getDefaultNoteTypes(): Promise<NoteTypeStarter[]> {
  const payload = await get('/api/templates/defaults');
  return Array.isArray(payload) ? (payload as NoteTypeStarter[]) : [];
}

export async function downloadNoteTypeApkg(
  noteType: AnkiNoteType,
  previewData: Record<string, string>
): Promise<Blob> {
  const response = await post('/api/templates/export', {
    noteType,
    previewData,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to export note type: ${response.status} ${response.statusText}`
    );
  }
  return response.blob();
}
