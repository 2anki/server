import sanitizeTags from './sanitizeTags';

describe('sanitizeTags', () => {
  it.each([
    ['spaces are handled', ['this tag'], ['this-tag']],
    ['tabs are handled', ['\tthis tag'], ['this-tag']],
    ['newlines are handled', ['\nthis tag'], ['this-tag']],
    ['double spaces are handled', ['\nthis    tag'], ['this-tag']],
  ])('%s', (_, input, expected) => {
    expect(sanitizeTags(input)).toEqual(expected);
  });
});
