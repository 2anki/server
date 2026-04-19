import {
  looksLikeEmptyContentExplanation,
  EMPTY_CONTENT_USER_MESSAGE,
  rewriteAudioAnchors,
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

describe('rewriteAudioAnchors', () => {
  it('replaces an mp3 anchor with a [sound:] token and lists the filename', () => {
    const { back, audioFilenames } = rewriteAudioAnchors(
      '<p>Listen: <a href="pronunciation.mp3">play</a></p>'
    );
    expect(audioFilenames).toEqual(['pronunciation.mp3']);
    expect(back).toContain('[sound:pronunciation.mp3]');
    expect(back).not.toContain('<a href');
  });

  it('strips the wrapping <figure> when present', () => {
    const { back } = rewriteAudioAnchors(
      '<figure><a href="word.ogg">🔊</a><figcaption>word</figcaption></figure>'
    );
    expect(back).not.toContain('<figure');
    expect(back).not.toContain('<a');
    expect(back).toContain('[sound:word.ogg]');
  });

  it('deduplicates if the same file is referenced twice on one card', () => {
    const { audioFilenames, back } = rewriteAudioAnchors(
      '<a href="a.mp3">x</a><a href="a.mp3">y</a>'
    );
    expect(audioFilenames).toEqual(['a.mp3']);
    expect(back.match(/\[sound:a\.mp3\]/g)).toHaveLength(1);
  });

  it('leaves http(s) audio links alone', () => {
    const input = '<a href="https://example.com/hello.mp3">play</a>';
    const { back, audioFilenames } = rewriteAudioAnchors(input);
    expect(audioFilenames).toEqual([]);
    expect(back).toContain(input);
  });

  it('decodes URL-encoded filenames before emitting the sound token', () => {
    const { back, audioFilenames } = rewriteAudioAnchors(
      '<a href="my%20word.m4a">play</a>'
    );
    expect(audioFilenames).toEqual(['my word.m4a']);
    expect(back).toContain('[sound:my word.m4a]');
  });

  it('supports ogg, wav, flac, m4a, aac, opus', () => {
    const exts = ['ogg', 'wav', 'flac', 'm4a', 'aac', 'opus'];
    for (const ext of exts) {
      const { audioFilenames } = rewriteAudioAnchors(
        `<a href="clip.${ext}">x</a>`
      );
      expect(audioFilenames).toEqual([`clip.${ext}`]);
    }
  });

  it('does nothing when the card has no audio links', () => {
    const input = '<p>No audio here</p><img src="x.png"/>';
    const { back, audioFilenames } = rewriteAudioAnchors(input);
    expect(audioFilenames).toEqual([]);
    expect(back).toBe(input);
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
