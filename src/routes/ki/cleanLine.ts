export function cleanLine(line: string): string {
  return line
    .trim()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^ndjson\n?/g, '');
}
