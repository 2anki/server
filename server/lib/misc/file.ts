import crypto from "crypto";
import fs from "fs";

// Try to avoid name conflicts && invalid characters by hashing
export function NewUniqueFileNameFrom(input: string) {
  const shasum = crypto.createHash("sha1");
  shasum.update(input);
  return shasum.digest("hex");
}

export function SuffixFrom(input: string) {
  if (!input) {
    return null;
  }
  const m = input.match(/\.[0-9a-z]+$/i);
  if (!m) {
    return null;
  }
  return m[0];
}

export function S3FileName(url: string): string {
  const u = url.split("?")[0].split("/");
  return u[u.length - 1];
}

export function BytesToMegaBytes(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function FileSizeInMegaBytes(filePath: string): number {
  const stats = fs.statSync(filePath);
  return BytesToMegaBytes(stats.size);
}
