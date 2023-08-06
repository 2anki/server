import fs from 'fs';

export function SuffixFrom(input: string) {
  return input ? /\.[0-9a-z]+$/i.exec(input)?.[0] ?? null : null;
}

export function S3FileName(url: string): string {
  const u = url.split('?')[0].split('/');
  return u[u.length - 1];
}

export function BytesToMegaBytes(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function FileSizeInMegaBytes(filePath: string): number {
  const stats = fs.statSync(filePath);
  return BytesToMegaBytes(stats.size);
}
