import { GoogleDriveRepository } from '../../data_layer/GoogleDriveRepository';

export type GoogleDriveUploadResponse = {
  id: string;
  iconUrl: string;
  mimeType: string;
  name: string;
  sizeBytes: string | null;
  url: string;
  last_converted_at: string | null;
};

export class GetGoogleDriveUploadsUseCase {
  constructor(private readonly repository: GoogleDriveRepository) {}

  async execute(
    owner: number,
    limit: number,
    offset: number
  ): Promise<GoogleDriveUploadResponse[]> {
    const rows = await this.repository.getByOwner(owner, limit, offset);
    return rows.map((row) => ({
      id: row.id,
      iconUrl: row.iconUrl,
      mimeType: row.mimeType,
      name: row.name,
      sizeBytes: row.sizeBytes,
      url: row.url,
      last_converted_at: row.last_converted_at,
    }));
  }
}
