import { Knex } from 'knex';

import { TIME_21_MINUTES_AS_SECONDS } from '../../constants';
import StorageHandler from '../../storage/StorageHandler';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;

export default async function deleteOldUploads(db: Knex) {
  const s = new StorageHandler();
  const files = await s.getContents();
  const now = new Date();

  if (!files) {
    return;
  }

  for (const file of files) {
    /* @ts-ignore */
    if (now - new Date(file.LastModified) > MS_21) {
      const upload = await db('uploads')
        .where('key', file.Key)
        .returning('owner');
      /* @ts-ignore */
      if (upload.owner) {
        console.info('file has an owner, skipping');
        continue;
      } else {
        await s.delete(file);
        console.debug(
          `Delete **** which was last modified on ${file.LastModified}`
        );
      }
    }
  }
}
