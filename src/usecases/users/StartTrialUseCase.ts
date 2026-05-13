import { TRIAL_DURATION_MS } from '../../lib/User/trialAccess';
import type { UsersId } from '../../data_layer/public/Users';

export type StartTrialResult =
  | { ok: true; trialExpiresAt: Date }
  | { ok: false; reason: 'already_paid' | 'already_used' };

export interface StartTrialUserRepository {
  getById(id: string): Promise<{
    patreon: boolean | null;
    trial_started_at: Date | null;
  } | null>;
  markTrialStarted(userId: string): Promise<unknown>;
}

class StartTrialUseCase {
  constructor(private readonly repository: StartTrialUserRepository) {}

  async execute(userId: UsersId, now = new Date()): Promise<StartTrialResult> {
    const user = await this.repository.getById(String(userId));
    if (user == null) {
      return { ok: false, reason: 'already_used' };
    }

    if (user.patreon === true) {
      return { ok: false, reason: 'already_paid' };
    }

    if (user.trial_started_at != null) {
      return { ok: false, reason: 'already_used' };
    }

    await this.repository.markTrialStarted(String(userId));
    return { ok: true, trialExpiresAt: new Date(now.getTime() + TRIAL_DURATION_MS) };
  }
}

export default StartTrialUseCase;
