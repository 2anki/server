import { Knex } from 'knex';

export type GoogleDriveFile = {
  downloadUrl?: string;
  uploadState?: string;
  description: string;
  driveSuccess: boolean;
  embedUrl: string;
  iconUrl: string;
  id: string;
  isShared: boolean;
  lastEditedUtc: number;
  mimeType: string;
  name: string;
  rotation: number;
  rotationDegree: number;
  serviceId: string;
  sizeBytes: number;
  type: string;
  url: string;
};

export class GoogleDriveRepository {
  constructor(private readonly database: Knex) {}

  private generateFileData(file: GoogleDriveFile, owner: number | string) {
    return {
      id: file.id,
      description: file.description,
      embedUrl: file.embedUrl,
      iconUrl: file.iconUrl,
      lastEditedUtc: file.lastEditedUtc,
      mimeType: file.mimeType,
      name: file.name,
      organizationDisplayName: '', // Assuming default value
      parentId: '', // Assuming default value
      serviceId: file.serviceId,
      sizeBytes: file.sizeBytes,
      type: file.type,
      url: file.url,
      owner: owner,
    };
  }

  async saveFiles(files: GoogleDriveFile[], owner: number | string) {
    for (const file of files) {
      const fileData = this.generateFileData(file, owner);
      try {
        await this.database('google_drive_uploads').insert(fileData);
      } catch (error) {
        if (!(error instanceof Error) || (error as any).code !== '23505')
          throw error;

        const existingFile = await this.database('google_drive_uploads')
          .where({ id: file.id, owner: owner })
          .first();

        if (!existingFile) throw error;

        await this.database('google_drive_uploads')
          .where({ id: file.id, owner: owner })
          .update(fileData);
      }
    }
  }
}
