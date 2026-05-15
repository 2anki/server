interface OwnerScopedDeleteAll {
  deleteAllByOwner(owner: string): Promise<number>;
}

class DeleteAllUserSettingsUseCase {
  constructor(
    private readonly settingsRepo: OwnerScopedDeleteAll,
    private readonly parserRulesRepo: OwnerScopedDeleteAll
  ) {}

  async execute(owner: string): Promise<void> {
    await Promise.all([
      this.settingsRepo.deleteAllByOwner(owner),
      this.parserRulesRepo.deleteAllByOwner(owner),
    ]);
  }
}

export default DeleteAllUserSettingsUseCase;
