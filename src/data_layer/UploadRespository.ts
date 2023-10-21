import { Knex } from 'knex';
import Uploads from './public/Uploads';

export interface IUploadRepository {
  deleteUpload(owner: number, key: string): Promise<number>;
  getUploadsByOwner(owner: number): Promise<Uploads[]>;
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
    return this.database(this.table).del().where({ owner, key });
  }

  getUploadsByOwner(owner: number): Promise<Uploads[]> {
    return this.database(this.table)
      .where({ owner: owner })
      .orderBy('id', 'desc')
      .returning('*');
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
