import { describe, expect, it } from 'vitest';
import { getAvatarInitial } from './getAvatarInitial';

describe('getAvatarInitial', () => {
  it('returns the uppercased first letter of the local-part', () => {
    expect(getAvatarInitial('alexander@alemayhu.com')).toBe('A');
  });

  it('uppercases lowercase first letters', () => {
    expect(getAvatarInitial('jane.doe@example.com')).toBe('J');
  });

  it('returns the uppercased first character when no @ is present', () => {
    expect(getAvatarInitial('alex')).toBe('A');
  });

  it('returns ? for null', () => {
    expect(getAvatarInitial(null)).toBe('?');
  });

  it('returns ? for undefined', () => {
    expect(getAvatarInitial(undefined)).toBe('?');
  });

  it('returns ? for empty string', () => {
    expect(getAvatarInitial('')).toBe('?');
  });

  it('returns ? for whitespace-only input', () => {
    expect(getAvatarInitial('   ')).toBe('?');
  });

  it('handles emails that begin with whitespace', () => {
    expect(getAvatarInitial('  bob@example.com  ')).toBe('B');
  });

  it('handles non-ascii characters', () => {
    expect(getAvatarInitial('élise@example.com')).toBe('É');
  });
});
