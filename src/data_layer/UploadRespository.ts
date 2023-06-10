import { Knex } from 'knex';

class UploadRepository {
  private readonly table = 'uploads';

  constructor(private readonly database: Knex) {}

  deleteUpload(owner: number, key: string) {
    return this.database(this.table).del().where({ owner, key });
  }

  getUploadsByOwner(owner: number) {
    return this.database(this.table)
      .where({ owner: owner })
      .orderBy('id', 'desc')
      .returning('*');
  }

  update(owner: number, filename: string, key: string, size_mb: number) {
    return this.database(this.table).insert({
      owner,
      filename,
      key,
      size_mb,
    });
  }
}

export default UploadRepository;
