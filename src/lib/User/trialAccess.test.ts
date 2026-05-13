import { hasUnlimitedAccess, isTrialActive, TRIAL_DURATION_MS } from './trialAccess';

describe('isTrialActive', () => {
  it('returns false when trial_started_at is null', () => {
    expect(isTrialActive({ patreon: false, trial_started_at: null })).toBe(false);
  });

  it('returns false when user is null', () => {
    expect(isTrialActive(null)).toBe(false);
  });

  it('returns false when user is undefined', () => {
    expect(isTrialActive(undefined)).toBe(false);
  });

  it('returns true when trial was activated 59 minutes ago', () => {
    const now = new Date();
    const fiftyNineMinutesAgo = new Date(now.getTime() - 59 * 60 * 1000);
    expect(
      isTrialActive({ patreon: false, trial_started_at: fiftyNineMinutesAgo }, now)
    ).toBe(true);
  });

  it('returns false when trial was activated 61 minutes ago', () => {
    const now = new Date();
    const sixtyOneMinutesAgo = new Date(now.getTime() - 61 * 60 * 1000);
    expect(
      isTrialActive({ patreon: false, trial_started_at: sixtyOneMinutesAgo }, now)
    ).toBe(false);
  });

  it('returns false exactly at the boundary (exclusive upper bound)', () => {
    const now = new Date();
    const exactlyAtExpiry = new Date(now.getTime() - TRIAL_DURATION_MS);
    expect(
      isTrialActive({ patreon: false, trial_started_at: exactlyAtExpiry }, now)
    ).toBe(false);
  });
});

describe('hasUnlimitedAccess', () => {
  it('returns true when patreon is true regardless of trial', () => {
    expect(
      hasUnlimitedAccess({ patreon: true, trial_started_at: null })
    ).toBe(true);
  });

  it('returns false when patreon is false and trial is null', () => {
    expect(
      hasUnlimitedAccess({ patreon: false, trial_started_at: null })
    ).toBe(false);
  });

  it('returns false when patreon is null and trial is null', () => {
    expect(
      hasUnlimitedAccess({ patreon: null, trial_started_at: null })
    ).toBe(false);
  });

  it('returns false for null user', () => {
    expect(hasUnlimitedAccess(null)).toBe(false);
  });

  it('returns false for undefined user', () => {
    expect(hasUnlimitedAccess(undefined)).toBe(false);
  });

  it('returns true when patreon is false but trial is active', () => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    expect(
      hasUnlimitedAccess({ patreon: false, trial_started_at: thirtyMinutesAgo }, now)
    ).toBe(true);
  });

  it('returns false when patreon is false and trial has expired', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(
      hasUnlimitedAccess({ patreon: false, trial_started_at: twoHoursAgo }, now)
    ).toBe(false);
  });
});
