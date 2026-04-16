import {
  looksLikeEmptyContentExplanation,
  EMPTY_CONTENT_USER_MESSAGE,
} from './ClaudeService';

describe('looksLikeEmptyContentExplanation', () => {
  it('detects the reported empty-page explanation', () => {
    const cleaned =
      '{ }\n\nThe provided HTML content is a flashcard application interface template with UI elements (buttons, progress bars, card display areas) but has no actual question-and-answer content to convert into flashcards. The document consists only of structural elements like divs, buttons, and placeholder elements with IDs for dynamic content injection.';
    expect(looksLikeEmptyContentExplanation(cleaned)).toBe(true);
  });

  it('detects a variety of no-content phrasings', () => {
    const samples = [
      'I cannot find any flashcard material in this document.',
      "I couldn't find any question-and-answer pairs to extract.",
      'The page has no extractable flashcard content.',
      'Nothing to convert — the page appears to be a template.',
    ];
    for (const sample of samples) {
      expect(looksLikeEmptyContentExplanation(sample)).toBe(true);
    }
  });

  it('does not match a malformed but real attempt at JSON', () => {
    const truncated =
      '[{"deck":"Biology","cards":[{"q":"What is mitosis","a":"Cell div';
    expect(looksLikeEmptyContentExplanation(truncated)).toBe(false);
  });

  it('does not match an empty JSON array', () => {
    expect(looksLikeEmptyContentExplanation('[]')).toBe(false);
  });
});

describe('EMPTY_CONTENT_USER_MESSAGE', () => {
  it('is friendly and free of technical jargon', () => {
    expect(EMPTY_CONTENT_USER_MESSAGE).toMatch(/Claude/);
    expect(EMPTY_CONTENT_USER_MESSAGE.toLowerCase()).not.toMatch(
      /html|<div|dom|dynamic content injection/
    );
    expect(EMPTY_CONTENT_USER_MESSAGE.toLowerCase()).toContain('notion page');
    expect(EMPTY_CONTENT_USER_MESSAGE.toLowerCase()).toMatch(
      /empty|layout element/
    );
  });
});
