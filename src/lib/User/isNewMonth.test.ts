import { isNewMonth } from './isNewMonth';

describe('isNewMonth', () => {
  it('returns false when both dates are in the same calendar month', () => {
    const startedAt = new Date(Date.UTC(2026, 4, 1));
    const now = new Date(Date.UTC(2026, 4, 30, 23, 59));
    expect(isNewMonth(startedAt, now)).toBe(false);
  });

  it('returns true when started date is in a prior month of the same year', () => {
    const startedAt = new Date(Date.UTC(2026, 4, 31, 23, 59));
    const now = new Date(Date.UTC(2026, 5, 1));
    expect(isNewMonth(startedAt, now)).toBe(true);
  });

  it('returns true when started date is in a prior year', () => {
    const startedAt = new Date(Date.UTC(2025, 11, 31));
    const now = new Date(Date.UTC(2026, 0, 1));
    expect(isNewMonth(startedAt, now)).toBe(true);
  });

  it('returns false when started date is in a future month (defensive)', () => {
    const startedAt = new Date(Date.UTC(2026, 5, 1));
    const now = new Date(Date.UTC(2026, 4, 31));
    expect(isNewMonth(startedAt, now)).toBe(false);
  });
});
