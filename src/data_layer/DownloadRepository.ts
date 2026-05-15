import { Knex } from 'knex';

class DownloadRepository {
  table: string;

  constructor(private database: Knex) {
    this.table = 'uploads';
  }

  getFile(owner: string, key: string) {
    if (owner == null) {
      console.warn('[DownloadRepository] getFile called with no owner');
      return Promise.resolve(undefined);
    }
    const query = { key, owner };
    return this.database(this.table).where(query).returning(['key']).first();
  }

  async getFilename(owner: string, key: string): Promise<string | null> {
    if (owner == null) {
      return null;
    }
    const row = await this.database(this.table)
      .where({ key, owner })
      .select('filename')
      .first();
    return row?.filename ?? null;
  }

  deleteMissingFile(owner: string, key: string) {
    if (owner == null) {
      console.warn(
        '[DownloadRepository] deleteMissingFile called with no owner'
      );
      return Promise.resolve(0);
    }
    console.warn(`Deleting missing file ${key} for ${owner}`);
    return this.database.table('uploads').where({ owner, key }).delete();
  }
}

export default DownloadRepository;
