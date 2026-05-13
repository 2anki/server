import { UpdateEmailPreferencesUseCase } from './UpdateEmailPreferencesUseCase';
import { InMemoryEmailPreferencesRepository } from '../data_layer/EmailPreferencesRepository';

describe('UpdateEmailPreferencesUseCase', () => {
  it('opt out sets marketing_opt_out to true', async () => {
    const repo = new InMemoryEmailPreferencesRepository();
    const useCase = new UpdateEmailPreferencesUseCase(repo);

    await useCase.execute({ userId: 1, marketingOptOut: true });

    expect(await repo.isOptedOut(1)).toBe(true);
  });

  it('opt in sets marketing_opt_out to false', async () => {
    const repo = new InMemoryEmailPreferencesRepository();
    await repo.optOut(1);
    const useCase = new UpdateEmailPreferencesUseCase(repo);

    await useCase.execute({ userId: 1, marketingOptOut: false });

    expect(await repo.isOptedOut(1)).toBe(false);
  });
});
