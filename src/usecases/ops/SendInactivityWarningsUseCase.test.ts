import { SendInactivityWarningsUseCase } from './SendInactivityWarningsUseCase';
import { InMemoryInactivityEmailRepository } from '../../data_layer/InactivityEmailRepository';

describe('SendInactivityWarningsUseCase', () => {
  let repo: InMemoryInactivityEmailRepository;
  let useCase: SendInactivityWarningsUseCase;

  beforeEach(() => {
    repo = new InMemoryInactivityEmailRepository();
    useCase = new SendInactivityWarningsUseCase(repo);
  });

  it('returns the candidate count and dryRun flag', async () => {
    repo.seedUsers([
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ]);

    const result = await useCase.execute(true);

    expect(result).toEqual({ count: 2, dryRun: true });
  });

  it('returns zero when no candidates exist', async () => {
    const result = await useCase.execute(true);

    expect(result).toEqual({ count: 0, dryRun: true });
  });

  it('reports dryRun=false when called with false', async () => {
    repo.seedUsers([{ id: 1, name: 'Alice', email: 'alice@example.com' }]);

    const result = await useCase.execute(false);

    expect(result.dryRun).toBe(false);
    expect(result.count).toBe(1);
  });
});
