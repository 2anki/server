import { Knex } from 'knex';

class DownloadRepository {
  table: string;

  constructor(private database: Knex) {
    this.table = 'uploads';
  }

  getFile(owner: string, key: string) {
    const query = { key, owner };
    return this.database(this.table).where(query).returning(['key']).first();
  }

  deleteMissingFile(owner: string, key: string) {
    console.warn(`Deleting missing file ${key} for ${owner}`);
    return this.database.table('uploads').where({ owner, key }).delete();
  }
}

export default DownloadRepository;
