import type { IInactivityEmailRepository } from '../../data_layer/InactivityEmailRepository';

export interface SendInactivityWarningsResult {
  count: number;
  dryRun: boolean;
}

export class SendInactivityWarningsUseCase {
  constructor(private readonly repo: IInactivityEmailRepository) {}

  async execute(dryRun: boolean): Promise<SendInactivityWarningsResult> {
    const users = await this.repo.getUsersToNotify();
    return { count: users.length, dryRun };
  }
}
