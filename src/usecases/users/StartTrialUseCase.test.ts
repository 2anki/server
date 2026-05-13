import StartTrialUseCase from './StartTrialUseCase';
import type { StartTrialUserRepository } from './StartTrialUseCase';
import type { UsersId } from '../../data_layer/public/Users';

const FAKE_USER_ID = 1 as UsersId;

function makeRepository(
  overrides: Partial<{
    patreon: boolean | null;
    trial_started_at: Date | null;
  }> = {}
): StartTrialUserRepository & { markTrialStartedCalled: boolean } {
  const user = {
    patreon: overrides.patreon ?? false,
    trial_started_at: overrides.trial_started_at ?? null,
  };
  const repo = {
    markTrialStartedCalled: false,
    async getById() {
      return user;
    },
    async markTrialStarted() {
      repo.markTrialStartedCalled = true;
    },
  };
  return repo;
}

describe('StartTrialUseCase', () => {
  it('returns ok:true and sets trialExpiresAt 1 hour from now', async () => {
    const repo = makeRepository({ patreon: false, trial_started_at: null });
    const now = new Date('2026-01-01T12:00:00Z');
    const useCase = new StartTrialUseCase(repo);

    const result = await useCase.execute(FAKE_USER_ID, now);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trialExpiresAt).toEqual(new Date('2026-01-01T13:00:00Z'));
    }
    expect(repo.markTrialStartedCalled).toBe(true);
  });

  it('returns already_paid when user has patreon', async () => {
    const repo = makeRepository({ patreon: true, trial_started_at: null });
    const useCase = new StartTrialUseCase(repo);

    const result = await useCase.execute(FAKE_USER_ID);

    expect(result).toEqual({ ok: false, reason: 'already_paid' });
    expect(repo.markTrialStartedCalled).toBe(false);
  });

  it('returns already_used when trial_started_at is already set', async () => {
    const repo = makeRepository({
      patreon: false,
      trial_started_at: new Date('2026-01-01T10:00:00Z'),
    });
    const useCase = new StartTrialUseCase(repo);

    const result = await useCase.execute(FAKE_USER_ID);

    expect(result).toEqual({ ok: false, reason: 'already_used' });
    expect(repo.markTrialStartedCalled).toBe(false);
  });

  it('returns already_used when user is not found', async () => {
    const repo: StartTrialUserRepository & { markTrialStartedCalled: boolean } = {
      markTrialStartedCalled: false,
      async getById() {
        return null;
      },
      async markTrialStarted() {
        repo.markTrialStartedCalled = true;
      },
    };
    const useCase = new StartTrialUseCase(repo);

    const result = await useCase.execute(FAKE_USER_ID);

    expect(result).toEqual({ ok: false, reason: 'already_used' });
    expect(repo.markTrialStartedCalled).toBe(false);
  });

  it('does not start trial when patreon is true even if trial_started_at is null', async () => {
    const repo = makeRepository({ patreon: true, trial_started_at: null });
    const useCase = new StartTrialUseCase(repo);

    const result = await useCase.execute(FAKE_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('already_paid');
    }
  });
});
