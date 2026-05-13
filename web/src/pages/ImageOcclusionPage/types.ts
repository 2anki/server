export interface OcclusionRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface ImageEntry {
  file: File;
  header: string;
  rects: OcclusionRect[];
  previewUrl: string;
}
