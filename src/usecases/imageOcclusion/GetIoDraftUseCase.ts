import { IoDraftRepositoryMulti, IoDraftImage } from '../../data_layer/IoDraftRepository';
import StorageHandler from '../../lib/storage/StorageHandler';

export class GetIoDraftUseCase {
  private readonly storage: StorageHandler;
  constructor(private readonly repo: IoDraftRepositoryMulti, storage?: StorageHandler) {
    this.storage = storage ?? new StorageHandler();
  }

  async executeList(userId: number) {
    const drafts = await this.repo.listByUser(userId);
    return drafts.map((d) => ({
      id: d.id, name: d.name, mode: d.mode,
      imageCount: Array.isArray(d.images) ? d.images.length : 0,
      cardCount: Array.isArray(d.images) ? (d.images as IoDraftImage[]).reduce((s, img) => s + (Array.isArray(img.rects) ? img.rects.length : 0), 0) : 0,
      updated_at: d.updated_at,
    }));
  }

  async executeOne(id: string, userId: number) {
    const draft = await this.repo.getById(id, userId);
    if (draft == null) return null;
    const images = await Promise.all((draft.images as IoDraftImage[]).map(async (img) => ({
      ...img, presignedUrl: await this.storage.getPresignedUrl(img.s3Key).catch(() => ''),
    })));
    return { ...draft, images };
  }
}
