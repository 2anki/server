import {
  CheckMonthlyCardLimitUseCase,
  ENFORCE_AFTER,
  MONTHLY_CARD_LIMIT,
  MonthlyLimitError,
} from './CheckMonthlyCardLimitUseCase';
import UsersRepository from '../../data_layer/UsersRepository';

function buildRepo(cards_used: number): UsersRepository {
  return {
    getCardUsage: jest
      .fn()
      .mockResolvedValue({ cards_used, month_started_at: new Date() }),
  } as unknown as UsersRepository;
}

const AFTER = new Date(ENFORCE_AFTER.getTime() + 86400000);
const BEFORE = new Date(ENFORCE_AFTER.getTime() - 86400000);

describe('CheckMonthlyCardLimitUseCase', () => {
  it('passes when free user has capacity remaining', async () => {
    const useCase = new CheckMonthlyCardLimitUseCase(buildRepo(50));
    await expect(
      useCase.execute({
        userId: '1',
        candidateCardCount: 30,
        isPaying: false,
        now: AFTER,
      })
    ).resolves.toBeUndefined();
  });

  it('throws when free user would exceed the limit', async () => {
    const useCase = new CheckMonthlyCardLimitUseCase(buildRepo(80));
    await expect(
      useCase.execute({
        userId: '1',
        candidateCardCount: 30,
        isPaying: false,
        now: AFTER,
      })
    ).rejects.toBeInstanceOf(MonthlyLimitError);
  });

  it('skips the check entirely for paying users', async () => {
    const repo = buildRepo(500);
    const useCase = new CheckMonthlyCardLimitUseCase(repo);
    await expect(
      useCase.execute({
        userId: '1',
        candidateCardCount: 200,
        isPaying: true,
        now: AFTER,
      })
    ).resolves.toBeUndefined();
    expect(repo.getCardUsage).not.toHaveBeenCalled();
  });

  it('skips the check before ENFORCE_AFTER even when over limit', async () => {
    const repo = buildRepo(500);
    const useCase = new CheckMonthlyCardLimitUseCase(repo);
    await expect(
      useCase.execute({
        userId: '1',
        candidateCardCount: 200,
        isPaying: false,
        now: BEFORE,
      })
    ).resolves.toBeUndefined();
    expect(repo.getCardUsage).not.toHaveBeenCalled();
  });

  it('exposes used, limit, candidate, and reset_on on the thrown error', async () => {
    const useCase = new CheckMonthlyCardLimitUseCase(buildRepo(95));
    try {
      await useCase.execute({
        userId: '1',
        candidateCardCount: 10,
        isPaying: false,
        now: AFTER,
      });
      throw new Error('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(MonthlyLimitError);
      const err = error as MonthlyLimitError;
      expect(err.cards_used).toBe(95);
      expect(err.limit).toBe(MONTHLY_CARD_LIMIT);
      expect(err.candidate).toBe(10);
      expect(err.reset_on).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});
