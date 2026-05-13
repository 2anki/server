import type { IEmailPreferencesRepository } from '../data_layer/EmailPreferencesRepository';

export interface UpdateEmailPreferencesInput {
  userId: number;
  marketingOptOut: boolean;
}

export class UpdateEmailPreferencesUseCase {
  constructor(private readonly repo: IEmailPreferencesRepository) {}

  async execute(input: UpdateEmailPreferencesInput): Promise<void> {
    if (input.marketingOptOut) {
      await this.repo.optOut(input.userId);
    } else {
      await this.repo.optIn(input.userId);
    }
  }
}
