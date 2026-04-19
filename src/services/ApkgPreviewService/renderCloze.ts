// Operates on note field content stored in the .apkg SQLite — already
// authenticated-user-scoped and bounded by Anki's export size. The
// negated `[^}]` classes can't backtrack across the closing `}}`.
const CLOZE_REGEX = /\{\{c(\d+)::([^}]*?)(?:::([^}]*?))?\}\}/g; // NOSONAR

export type ClozeSide = 'front' | 'back';

export function hasClozeMarkers(value: string): boolean {
  CLOZE_REGEX.lastIndex = 0;
  return CLOZE_REGEX.test(value);
}

export function applyCloze(
  value: string,
  activeNumber: number,
  side: ClozeSide
): string {
  return value.replace(
    CLOZE_REGEX,
    (_full, numRaw: string, answer: string, hint?: string) => {
      const num = Number.parseInt(numRaw, 10);
      if (num === activeNumber) {
        if (side === 'front') {
          const placeholder = hint && hint.length > 0 ? hint : '…';
          return `<span class="cloze">[${placeholder}]</span>`;
        }
        return `<span class="cloze">${answer}</span>`;
      }
      return answer;
    }
  );
}

export function applyClozeToFields(
  fields: string[],
  activeNumber: number,
  side: ClozeSide
): string[] {
  return fields.map((value) => applyCloze(value, activeNumber, side));
}
