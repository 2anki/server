import { PlainTextParser } from './PlainTextParser';
import { isClozeFlashcard } from './types';

describe('PlainTextParser', () => {
  describe('parse', () => {
    it('should correctly identify cloze deletion with backticks and = separator', () => {
      const parser = new PlainTextParser();
      const input = '- hübsch, schön = `bonito`';
      const result = parser.parse(input);

      expect(result.length).toBe(1);
      expect(isClozeFlashcard(result[0])).toBe(true);

      if (isClozeFlashcard(result[0])) {
        expect(result[0].front).toContain('{{c1::bonito}}');
      }
    });

    it('should correctly identify cloze deletion with underscores and - separator', () => {
      const parser = new PlainTextParser();
      const input = '- hübsch, schön - ___';
      const result = parser.parse(input);

      expect(result.length).toBe(1);
      expect(isClozeFlashcard(result[0])).toBe(true);

      if (isClozeFlashcard(result[0])) {
        expect(result[0].front).toContain('{{c1::hübsch}}');
      }
    });

    it('should correctly handle basic flashcards with - separator', () => {
      const parser = new PlainTextParser();
      const input = '- Question - Answer';
      const result = parser.parse(input);

      expect(result.length).toBe(1);
      expect(isClozeFlashcard(result[0])).toBe(false);

      if (!isClozeFlashcard(result[0])) {
        expect(result[0].front).toBe('- Question');
        expect(result[0].back).toBe('Answer');
      }
    });

    it('should correctly handle basic flashcards with = separator', () => {
      const parser = new PlainTextParser();
      const input = '- Question = Answer';
      const result = parser.parse(input);

      expect(result.length).toBe(1);
      expect(isClozeFlashcard(result[0])).toBe(false);

      if (!isClozeFlashcard(result[0])) {
        expect(result[0].front).toBe('- Question');
        expect(result[0].back).toBe('Answer');
      }
    });
  });
});
