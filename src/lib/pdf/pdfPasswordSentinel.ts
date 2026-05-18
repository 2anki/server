const SENTINEL_PREFIX = 'PDF_NEEDS_PASSWORD';
const SENTINEL_SEPARATOR = '\x00';

export function buildPdfPasswordSentinel(filename: string): string {
  return `${SENTINEL_PREFIX}${SENTINEL_SEPARATOR}${filename}`;
}

export function parsePdfPasswordSentinel(message: string): string | null {
  if (!message.startsWith(`${SENTINEL_PREFIX}${SENTINEL_SEPARATOR}`)) {
    return null;
  }
  return message.slice(SENTINEL_PREFIX.length + SENTINEL_SEPARATOR.length);
}

export function isPdfPasswordSentinel(message: string): boolean {
  return message.startsWith(`${SENTINEL_PREFIX}${SENTINEL_SEPARATOR}`);
}
