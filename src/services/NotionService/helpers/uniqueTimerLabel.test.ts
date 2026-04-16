import { uniqueTimerLabel } from './uniqueTimerLabel';

describe('uniqueTimerLabel', () => {
  test('returns distinct labels for repeated calls with the same prefix', () => {
    const first = uniqueTimerLabel('search:true');
    const second = uniqueTimerLabel('search:true');
    expect(first).not.toBe(second);
  });

  test('includes the provided prefix in the label', () => {
    const label = uniqueTimerLabel('search:true');
    expect(label.startsWith('search:true')).toBe(true);
  });

  test('handles prefixes with undefined substrings', () => {
    const label = uniqueTimerLabel(`search:${undefined}`);
    expect(label).toMatch(/^search:undefined/);
    expect(label).not.toBe('search:undefined');
  });
});
