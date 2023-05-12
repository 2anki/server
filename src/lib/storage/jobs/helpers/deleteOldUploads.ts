import { Knex } from 'knex';
import Uploads from '../../../../schemas/public/Uploads';

import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';
import StorageHandler from '../../StorageHandler';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;
const MAX_KEYS = 100_000;

const deleteNonSubScriberUploads = async (
  db: Knex,
  storage: StorageHandler
) => {
  const query = await db.raw(`
    SELECT up.key FROM users u JOIN uploads up ON u.id = up.owner WHERE u.patreon = false;
  `);
  const nonSubScriberUploads: Uploads[] | undefined = query.rows;
  if (!nonSubScriberUploads) {
    return;
  }

  for (const upload of nonSubScriberUploads.flat()) {
    await storage.delete(upload.key);
    await db('uploads').delete().where('key', upload.key);
  }
};

const deleteDanglingUploads = async (db: Knex, storage: StorageHandler) => {
  const query = await db.raw(`
    SELECT up.key FROM users u JOIN uploads up ON u.id = up.owner WHERE u.patreon = true;
    `);
  const subScriberUploads: Uploads[] | [] = query.rows || [];
  const storedFiles = await storage.getContents(MAX_KEYS);
  const nonPatreonFiles =
    storedFiles?.filter(
      (f) => f.Key && !subScriberUploads.find((up) => up.key === f.Key)
    ) || [];

  for (const file of nonPatreonFiles) {
    if (file.Key) {
      storage.delete(file.Key);
    }
  }
};

export default async function deleteOldUploads(db: Knex) {
  const storage = new StorageHandler();
  await deleteNonSubScriberUploads(db, storage);
  await deleteDanglingUploads(db, storage);
}
