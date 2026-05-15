import { GoogleDriveRepository } from '../../data_layer/GoogleDriveRepository';

export class DeleteGoogleDriveUploadUseCase {
  constructor(private readonly repository: GoogleDriveRepository) {}

  async execute(id: string, owner: number): Promise<void> {
    const deleted = await this.repository.deleteByIdAndOwner(id, owner);
    if (deleted === 0) {
      throw new Error('Not found');
    }
  }
}
