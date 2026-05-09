import { hasAnkifyAccess } from './access';

describe('hasAnkifyAccess', () => {
  test('returns false for null/undefined user', () => {
    expect(hasAnkifyAccess(null)).toBe(false);
    expect(hasAnkifyAccess(undefined)).toBe(false);
  });

  test('returns false when patreon is null', () => {
    expect(hasAnkifyAccess({ patreon: null })).toBe(false);
  });

  test('returns false when patreon is false', () => {
    expect(hasAnkifyAccess({ patreon: false })).toBe(false);
  });

  test('returns true when patreon is true', () => {
    expect(hasAnkifyAccess({ patreon: true })).toBe(true);
  });
});
