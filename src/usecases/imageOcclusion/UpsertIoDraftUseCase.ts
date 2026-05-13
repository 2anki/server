import { IoDraftRepositoryMulti, IoDraftImage } from '../../data_layer/IoDraftRepository';

export interface UpsertIoDraftInput {
  userId: number;
  draftId: string | null;
  name: string;
  mode: string;
  images: IoDraftImage[];
}

export class UpsertIoDraftUseCase {
  constructor(private readonly repo: IoDraftRepositoryMulti) {}

  async execute(input: UpsertIoDraftInput): Promise<{ id: string }> {
    if (input.draftId != null) {
      await this.repo.update(input.draftId, input.userId, input.name, input.mode, input.images);
      return { id: input.draftId };
    }
    const id = await this.repo.create(input.userId, input.name, input.mode, input.images);
    return { id };
  }
}
