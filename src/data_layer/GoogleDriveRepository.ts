import { Knex } from 'knex';

export const GOOGLE_DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';

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

export type GoogleDriveUploadRow = {
  id: string;
  iconUrl: string;
  mimeType: string;
  name: string;
  sizeBytes: string | null;
  url: string;
  owner: number;
  last_converted_at: string | null;
};

export class GoogleDriveRepository {
  private readonly table = 'google_drive_uploads';

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
      organizationDisplayName: '',
      parentId: '',
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
        await this.database(this.table).insert(fileData);
      } catch (error) {
        if (!(error instanceof Error) || (error as any).code !== '23505')
          throw error;

        const existingFile = await this.database(this.table)
          .where({ id: file.id, owner: owner })
          .first();

        if (!existingFile) throw error;

        await this.database(this.table)
          .where({ id: file.id, owner: owner })
          .update({ ...fileData, last_converted_at: this.database.fn.now() });
      }
    }
  }

  getByOwner(
    owner: number,
    limit: number,
    offset: number
  ): Promise<GoogleDriveUploadRow[]> {
    if (owner == null) {
      console.warn('[GoogleDriveRepository] getByOwner called with no owner');
      return Promise.resolve([]);
    }
    return this.database(this.table)
      .select(
        'id',
        'iconUrl',
        'mimeType',
        'name',
        'sizeBytes',
        'url',
        'owner',
        'last_converted_at'
      )
      .where({ owner })
      .andWhere('mimeType', '!=', GOOGLE_DRIVE_FOLDER_MIME)
      .orderByRaw('last_converted_at DESC NULLS LAST')
      .limit(limit)
      .offset(offset);
  }

  deleteByIdAndOwner(id: string, owner: number): Promise<number> {
    if (owner == null || id == null) {
      console.warn(
        '[GoogleDriveRepository] deleteByIdAndOwner called with missing id or owner'
      );
      return Promise.resolve(0);
    }
    return this.database(this.table).where({ id, owner }).del();
  }
}
