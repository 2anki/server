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

/**
 * Check if the file name is equal to the name
 * This can be used to find the contents of a file in the payload.
 * Due to encoding issues, we need to check both the encoded and decoded names
 *
 * @param file uploaded file from user
 * @param name name of the file
 * @returns true if the file name is equal to the name
 */
export function isFileNameEqual(file: File, name: string) {
  try {
    // For backwards compatibility, we need to support the old way of parsing
    const decodedName = global.decodeURIComponent(name);
    if (file.name === decodedName) {
      return true;
    }
  } catch (error) {
    console.error(error);
    console.debug('Failed to decode name');
  }

  try {
    const decodedFilename = global.decodeURIComponent(file.name);
    const decodedName = global.decodeURIComponent(name);

    return decodedFilename === decodedName;
  } catch (error) {
    console.error(error);
    console.debug('Failed to decode names');
  }

  return file.name === name;
}
