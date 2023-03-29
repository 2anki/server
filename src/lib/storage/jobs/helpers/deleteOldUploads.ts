import { Knex } from 'knex';
import Users from '../../../../schemas/public/Users';

import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';
import StorageHandler from '../../StorageHandler';
import { Upload } from '../../types';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;

const getFreeUsers = (db: Knex): Promise<Users[]> =>
  db('users').where('patreon', 'false').returning(['owner']);

const getUploadsForUser = (user: Users, db: Knex): Promise<Upload> =>
  db('uploads').where('owner', user.id).returning(['key']);

export default async function deleteOldUploads(db: Knex) {
  const storage = new StorageHandler();
  const users = await getFreeUsers(db);
  const uploads = await Promise.all(
    users.map((user) => getUploadsForUser(user, db))
  );

  for (const upload of uploads.flat()) {
    console.debug('delete', upload.key);
    await storage.deleteWith(upload.key);
    await db('uploads').delete().where('key', upload.key);
  }
}
