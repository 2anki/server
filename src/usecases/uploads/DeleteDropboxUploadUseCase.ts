import { DropboxRepository } from '../../data_layer/DropboxRepository';

export class DeleteDropboxUploadUseCase {
  constructor(private readonly repository: DropboxRepository) {}

  async execute(id: number, owner: number): Promise<void> {
    const deleted = await this.repository.deleteByIdAndOwner(id, owner);
    if (deleted === 0) {
      throw new Error('Not found');
    }
  }
}
