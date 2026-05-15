const PDF = [0x25, 0x50, 0x44, 0x46];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];
const GIF87A = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
const GIF89A = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

function startsWith(buf: Buffer, sig: number[], offset = 0): boolean {
  if (buf.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false;
  }
  return true;
}

export function detectFileMime(buf: Buffer): string | null {
  if (startsWith(buf, PDF)) return 'application/pdf';
  if (startsWith(buf, PNG)) return 'image/png';
  if (startsWith(buf, JPEG)) return 'image/jpeg';
  if (startsWith(buf, GIF87A) || startsWith(buf, GIF89A)) return 'image/gif';
  if (startsWith(buf, RIFF) && startsWith(buf, WEBP, 8)) return 'image/webp';
  return null;
}
