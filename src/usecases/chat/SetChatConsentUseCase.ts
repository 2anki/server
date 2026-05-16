export interface IChatConsentRepository {
  setChatConsentAt(userId: number): Promise<void>;
}

export class SetChatConsentUseCase {
  constructor(private readonly usersRepo: IChatConsentRepository) {}

  execute(userId: number): Promise<void> {
    return this.usersRepo.setChatConsentAt(userId);
  }
}
