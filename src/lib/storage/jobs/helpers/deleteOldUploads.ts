import { Knex } from 'knex';
import Uploads from '../../../../schemas/public/Uploads';

import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';
import StorageHandler from '../../StorageHandler';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;
const MAX_KEYS = 100_000;

export default async function deleteOldUploads(db: Knex) {
  const storage = new StorageHandler();
  const nonSubScriberUploads: Uploads[] = await db.raw(`
    SELECT up.key FROM users u JOIN uploads up ON u.id = up.owner WHERE u.patreon = false;
  `);

  for (const upload of nonSubScriberUploads.flat()) {
    console.debug('delete', upload.key);
    await storage.deleteWith(upload.key);
    await db('uploads').delete().where('key', upload.key);
  }

  const storedFiles = await storage.getContents(MAX_KEYS);
  const nonPatreonFiles =
    storedFiles?.filter(
      (f) => f.Key && nonSubScriberUploads.find((up) => up.key === f.Key)
    ) || [];

  for (const file of nonPatreonFiles) {
    if (file.Key) {
      storage.deleteWith(file.Key);
    }
  }
}
