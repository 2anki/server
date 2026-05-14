import { File } from '../zip/zip';

// Multer types
export interface UploadedFile extends Express.Multer.File {
  key: string;
}

// Database types (matching tables)
export interface Upload {
  id: number;
  owner: number;
  key: string;
  filename: string;
  object_id: string;
  size_mb: number;
  external_url: string;
}

export type JobStatus =
  | 'started'
  | 'step1_create_workspace'
  | 'step2_creating_flashcards'
  | 'step3_building_deck'
  | 'stale'
  | 'failed'
  | 'cancelled';

export interface Job {
  id: string;
  owner: string;
  object_id: string;
  status: JobStatus;
  created_at: Date;
  last_edited_time: Date;
  title: string;
  type: string;
  job_reason_failure?: string;
}

function recoverLatin1(s: string): string {
  return Buffer.from(s, 'latin1').toString('utf8');
}

function safeDecodeURIComponent(s: string): string {
  try {
    return global.decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function isFileNameEqual(file: File, name: string) {
  if (file.name === name) {
    return true;
  }

  const decodedFileName = safeDecodeURIComponent(file.name);
  const decodedName = safeDecodeURIComponent(name);

  if (decodedFileName === decodedName) {
    return true;
  }

  const recoveredFileName = recoverLatin1(file.name);
  const recoveredName = recoverLatin1(name);

  return recoveredFileName === decodedName || decodedFileName === recoveredName;
}
