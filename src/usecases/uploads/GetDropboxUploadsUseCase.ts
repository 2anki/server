import { DropboxRepository } from '../../data_layer/DropboxRepository';

export type DropboxUploadResponse = {
  id: number;
  bytes: number;
  name: string;
  created_at: string | null;
};

export class GetDropboxUploadsUseCase {
  constructor(private readonly repository: DropboxRepository) {}

  async execute(
    owner: number,
    limit: number,
    offset: number
  ): Promise<DropboxUploadResponse[]> {
    const rows = await this.repository.getByOwner(owner, limit, offset);
    return rows.map((row) => ({
      id: row.id,
      bytes: row.bytes,
      name: row.name,
      created_at: row.created_at,
    }));
  }
}
