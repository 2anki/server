import { Knex } from 'knex';

import deleteOldFiles from './deleteOldFiles';
import deleteOldUploads from './deleteOldUploads';
import DB from '../../db';

export const runCleanup = async (db: Knex) => {
  console.time('running cleanup');
  deleteOldFiles();
  await deleteOldUploads(db);
  db.raw(
    "DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '14 days' AND status = 'failed'"
  );
  console.timeEnd('running cleanup');
};

if (require.main === module) {
  runCleanup(DB);
}