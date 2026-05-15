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

export async function getOfficialNoteTypes(): Promise<NoteTypeStarter[]> {
  const payload = await get('/api/templates/official');
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

export interface UserTemplatesPayload {
  templates: NoteTypeStarter[];
  hiddenIds: string[];
}

const EMPTY_USER_PAYLOAD: UserTemplatesPayload = {
  templates: [],
  hiddenIds: [],
};

export async function getUserTemplates(): Promise<UserTemplatesPayload> {
  const payload = await get('/api/templates/user');
  if (!payload || typeof payload !== 'object') {
    return EMPTY_USER_PAYLOAD;
  }
  const data = payload as Partial<UserTemplatesPayload>;
  return {
    templates: Array.isArray(data.templates) ? data.templates : [],
    hiddenIds: Array.isArray(data.hiddenIds) ? data.hiddenIds : [],
  };
}

async function putUserTemplates(payload: UserTemplatesPayload): Promise<void> {
  const response = await fetch('/api/templates/user', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to save templates: ${response.status} ${response.statusText}`
    );
  }
}

export async function saveUserTemplate(
  template: NoteTypeStarter
): Promise<UserTemplatesPayload> {
  const current = await getUserTemplates();
  const next = current.templates.filter((t) => t.id !== template.id);
  next.push(template);
  const payload = { ...current, templates: next };
  await putUserTemplates(payload);
  return payload;
}

export async function deleteUserTemplate(
  id: string
): Promise<UserTemplatesPayload> {
  const current = await getUserTemplates();
  const payload = {
    ...current,
    templates: current.templates.filter((t) => t.id !== id),
  };
  await putUserTemplates(payload);
  return payload;
}
