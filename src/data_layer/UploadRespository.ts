import { Knex } from 'knex';
import Uploads from './public/Uploads';

export interface IUploadRepository {
  deleteUpload(owner: number, key: string): Promise<number>;
  getUploadsByOwner(owner: number): Promise<Uploads[]>;
  findByIdAndOwner(id: number, owner: number): Promise<Uploads | null>;
  update(
    owner: number,
    filename: string,
    key: string,
    size_mb: number
  ): Promise<Uploads[]>;
}
class UploadRepository implements IUploadRepository {
  private readonly table = 'uploads';

  constructor(private readonly database: Knex) {}

  deleteUpload(owner: number, key: string): Promise<number> {
    if (owner == null) {
      console.warn('[UploadRepository] deleteUpload called with no owner');
      return Promise.resolve(0);
    }
    return this.database(this.table).del().where({ owner, key });
  }

  getUploadsByOwner(owner: number): Promise<Uploads[]> {
    if (owner == null) {
      console.warn(
        '[UploadRepository] getUploadsByOwner called with no owner'
      );
      return Promise.resolve([]);
    }
    return this.database(this.table)
      .where({ owner: owner })
      .orderBy('id', 'desc')
      .returning('*');
  }

  async findByIdAndOwner(id: number, owner: number): Promise<Uploads | null> {
    if (owner == null || id == null) {
      return null;
    }
    const row = await this.database<Uploads>(this.table)
      .select('*')
      .where({ id, owner })
      .first();
    return row ?? null;
  }

  update(
    owner: number,
    filename: string,
    key: string,
    size_mb: number
  ): Promise<Uploads[]> {
    return this.database(this.table).insert({
      owner,
      filename,
      key,
      size_mb,
    });
  }
}

export default UploadRepository;
