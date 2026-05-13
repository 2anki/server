import { hasUnlimitedAccess } from './User/trialAccess';

export const isPaying = (locals?: Record<string, unknown>) => {
  if (!locals) {
    return false;
  }
  if (locals.patreon || locals.subscriber) return true;
  return hasUnlimitedAccess({
    patreon: (locals.patreon as boolean | null) ?? null,
    trial_started_at: (locals.trial_started_at as Date | null) ?? null,
  });
};
