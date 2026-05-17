import JobResponse from '../../../schemas/public/JobResponse';
import UserUpload from '../../../lib/interfaces/UserUpload';
import { DropboxUpload, GoogleDriveUpload } from '../../../lib/backend';

export type DeckRow =
  | { source: 'notion'; kind: 'job'; job: JobResponse; sortKey: Date }
  | { source: 'upload'; kind: 'job'; job: JobResponse; sortKey: Date }
  | { source: 'upload'; kind: 'file'; upload: UserUpload; sortKey: Date }
  | { source: 'dropbox'; kind: 'dropbox'; upload: DropboxUpload; sortKey: Date }
  | { source: 'drive'; kind: 'drive'; upload: GoogleDriveUpload; sortKey: Date };

const NOTION_TYPES = new Set(['page', 'database', 'conversion']);
const EPOCH = new Date(0);

function jobSource(type: string | null | undefined): 'notion' | 'upload' {
  if (type != null && NOTION_TYPES.has(type)) return 'notion';
  return 'upload';
}

export function toDeckRows(
  jobs: JobResponse[],
  uploads: UserUpload[],
  dropboxUploads: DropboxUpload[],
  googleDriveUploads: GoogleDriveUpload[],
): DeckRow[] {
  const rows: DeckRow[] = [];

  for (const job of jobs) {
    const sortKey = job.created_at == null ? EPOCH : new Date(job.created_at);
    const source = jobSource(job.type);
    rows.push({ source, kind: 'job', job, sortKey });
  }

  for (const upload of uploads) {
    const sortKey = upload.created_at == null ? EPOCH : new Date(upload.created_at);
    rows.push({ source: 'upload', kind: 'file', upload, sortKey });
  }

  for (const upload of dropboxUploads) {
    const sortKey = upload.created_at == null ? EPOCH : new Date(upload.created_at);
    rows.push({ source: 'dropbox', kind: 'dropbox', upload, sortKey });
  }

  for (const upload of googleDriveUploads) {
    const sortKey = upload.last_converted_at == null ? EPOCH : new Date(upload.last_converted_at);
    rows.push({ source: 'drive', kind: 'drive', upload, sortKey });
  }

  rows.sort((a, b) => b.sortKey.getTime() - a.sortKey.getTime());

  return rows;
}
