import { IoDraftRepositoryMulti, IoDraftImage } from '../../data_layer/IoDraftRepository';
import StorageHandler from '../../lib/storage/StorageHandler';

export class DeleteIoDraftUseCase {
  private readonly storage: StorageHandler;
  constructor(private readonly repo: IoDraftRepositoryMulti, storage?: StorageHandler) {
    this.storage = storage ?? new StorageHandler();
  }

  async execute(id: string, userId: number): Promise<void> {
    const images = await this.repo.deleteById(id, userId);
    await Promise.all((images as IoDraftImage[]).map((img) => this.storage.delete(img.s3Key)));
  }
}
