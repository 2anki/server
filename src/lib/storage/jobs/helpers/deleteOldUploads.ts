import { Knex } from 'knex';
import Uploads from '../../../../schemas/public/Uploads';
import Users from '../../../../schemas/public/Users';

import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';
import StorageHandler from '../../StorageHandler';
import { Upload } from '../../types';
import { sendError } from '../../../error/sendError';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;
const MAX_KEYS = 100_000;

const getFreeUsers = (db: Knex): Promise<Users[]> =>
  db('users').where('patreon', 'false').returning(['owner']);

const getUploadsForUser = (user: Users, db: Knex): Promise<Upload> =>
  db('uploads').where('owner', user.id).returning(['key']);

const purgeUploads = async (
  db: Knex,
  storage: StorageHandler,
  uploads: Upload[]
) => {
  console.debug('purging anon uploads');
  for (const upload of uploads.flat()) {
    console.debug('delete', upload.key);
    await storage.deleteWith(upload.key);
    await db('uploads').delete().where('key', upload.key);
  }
};

const purgeBucket = async (db: Knex, storage: StorageHandler) => {
  console.debug('purging bucket uploads');
  const query = await db.raw(`
    SELECT up.key FROM users u JOIN uploads up ON u.id = up.owner WHERE u.patreon = true;
  `);
  const anonUploads = query.rows as Uploads[];
  const { s3 } = storage;

  return new Promise<void>(async (resolve, reject) => {
    try {
      let hasMore = true;
      while (hasMore) {
        const objects = await s3
          .listObjects({
            Bucket: StorageHandler.DefaultBucketName(),
            MaxKeys: MAX_KEYS,
          })
          .promise();
        console.debug('found', objects.Contents?.length, 'uploads');
        if (objects.Contents) {
          const nonPatreonFiles =
            objects.Contents?.filter(
              (f) => f.Key && anonUploads.find((up) => up.key !== f.Key)
            ) || [];
          for (const no of nonPatreonFiles) {
            if (no.Key) {
              storage.deleteWith(no.Key);
            }
          }
        }
        hasMore = Boolean(objects.IsTruncated);
      }
    } catch (err) {
      if (err) {
        sendError(err);
        return reject(err);
      }
    }
    resolve();
  });
};

export default async function deleteOldUploads(db: Knex) {
  const storage = new StorageHandler();
  const users = await getFreeUsers(db);
  const uploads = await Promise.all(
    users.map((user) => getUploadsForUser(user, db))
  );

  purgeUploads(db, storage, uploads);
  await purgeBucket(db, storage);
  console.debug('done cleanup');
}
