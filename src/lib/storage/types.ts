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
  | 'failed';

export interface Job {
  id: string;
  owner: string;
  object_id: string;
  status: JobStatus;
  created_at: Date;
  last_edited_time: Date;
  title: string;
  type: string;
}
