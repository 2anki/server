import { SetChatConsentUseCase } from './SetChatConsentUseCase';

interface FakeUsersRepository {
  setChatConsentAt: jest.Mock;
}

function buildFakeRepo(): FakeUsersRepository {
  return { setChatConsentAt: jest.fn().mockResolvedValue(undefined) };
}

describe('SetChatConsentUseCase', () => {
  it('calls setChatConsentAt on the repository with the correct userId', async () => {
    const repo = buildFakeRepo();
    const useCase = new SetChatConsentUseCase(repo);
    await useCase.execute(42);
    expect(repo.setChatConsentAt).toHaveBeenCalledWith(42);
  });

  it('propagates repository errors', async () => {
    const repo = buildFakeRepo();
    repo.setChatConsentAt.mockRejectedValueOnce(new Error('DB error'));
    const useCase = new SetChatConsentUseCase(repo);
    await expect(useCase.execute(1)).rejects.toThrow('DB error');
  });
});
