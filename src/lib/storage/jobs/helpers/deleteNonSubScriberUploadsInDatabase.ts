import { Knex } from 'knex';
import StorageHandler from '../../StorageHandler';
import Uploads from '../../../../data_layer/public/Uploads';

export const deleteNonSubScriberUploadsInDatabase = async (
  db: Knex,
  storage: StorageHandler
) => {
  const query = await db.raw(`
    SELECT up.key 
    FROM users u 
    JOIN uploads up ON u.id = up.owner 
    LEFT JOIN subscriptions s ON u.email = s.email OR u.email = s.linked_email
    WHERE u.patreon = false AND (s.active IS NULL OR s.active = false);
  `);
  const nonSubScriberUploads: Uploads[] | undefined = query.rows;
  if (!nonSubScriberUploads) {
    return;
  }

  for (const upload of nonSubScriberUploads.flat()) {
    console.info(`Deleting non-subscriber upload ${upload.key}`);
    await storage.delete(upload.key);
    await db('uploads').delete().where('key', upload.key);
  }
};
