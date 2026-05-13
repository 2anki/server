export const TRIAL_DURATION_MS = 60 * 60 * 1000;

export interface TrialUser {
  patreon: boolean | null;
  trial_started_at: Date | null;
}

export const isTrialActive = (
  user: TrialUser | null | undefined,
  now = new Date()
): boolean => {
  if (user?.trial_started_at == null) return false;
  return now.getTime() - user.trial_started_at.getTime() < TRIAL_DURATION_MS;
};

export const hasUnlimitedAccess = (
  user: TrialUser | null | undefined,
  now = new Date()
): boolean => user?.patreon === true || isTrialActive(user, now);
