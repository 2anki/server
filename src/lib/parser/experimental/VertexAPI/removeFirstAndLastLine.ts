/**
 * Google VertexAI is returning Markdown:
 * ```html
 * [...]
 * ```
 * So we need to remove the first and last line
 */
export function removeFirstAndLastLine(content: string): string {
  const lines = content.split('\n');
  return lines.slice(1, -1).join('\n');
}
