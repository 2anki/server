import { __test__ } from './AINoteTypeUseCase';

const { extractJsonBlock } = __test__;

describe('extractJsonBlock', () => {
  it('returns the fenced JSON content when wrapped in ```json ... ```', () => {
    const text = 'Here you go:\n```json\n{"a":1}\n```\nThat is all.';
    expect(extractJsonBlock(text)).toBe('{"a":1}');
  });

  it('returns null when no JSON-looking content is present', () => {
    expect(extractJsonBlock('no json here, just prose.')).toBeNull();
  });

  it('returns the first balanced JSON object when no fence is used', () => {
    const text = 'Reply: {"a":{"b":2},"c":[1,2,3]} and more';
    expect(extractJsonBlock(text)).toBe('{"a":{"b":2},"c":[1,2,3]}');
  });

  it('handles braces inside strings without breaking depth tracking', () => {
    const text = '{"css":"a { color: red; } b { font: \\"x\\"; }"}';
    expect(extractJsonBlock(text)).toBe(text);
  });

  it('handles a 100k blob without pathological backtracking', () => {
    const big = `\`\`\`json\n${'{"k":"' + 'x'.repeat(100_000) + '"}'}\n\`\`\``;
    const start = Date.now();
    const result = extractJsonBlock(big);
    const ms = Date.now() - start;
    expect(result).not.toBeNull();
    expect(result?.startsWith('{"k":"')).toBe(true);
    expect(ms).toBeLessThan(2000);
  });

  it('falls back to the bare JSON object if the fence is unmatched', () => {
    expect(extractJsonBlock('```json\n{"a":1}')).toBe('{"a":1}');
  });

  it('returns null when the bare object has no matching closing brace', () => {
    expect(extractJsonBlock('{"a":1')).toBeNull();
  });
});
