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
