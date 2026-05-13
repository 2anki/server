import type { IUserPreferencesRepository, UserPreferences } from '../data_layer/UserPreferencesRepository';
import type { CardOptions } from '../data_layer/UserPreferencesRepository';

export interface PatchUserPreferencesInput {
  userId: number;
  cardOptions?: CardOptions;
  theme?: string;
}

export class PatchUserPreferencesUseCase {
  constructor(private readonly repo: IUserPreferencesRepository) {}

  execute(input: PatchUserPreferencesInput): Promise<UserPreferences> {
    return this.repo.patch(input.userId, {
      cardOptions: input.cardOptions,
      theme: input.theme,
    });
  }
}
