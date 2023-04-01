import { Knex } from 'knex';

import deleteOldUploads, { MS_21 } from './helpers/deleteOldUploads';
import deleteOldFiles from './helpers/deleteOldFiles';

export const ScheduleCleanup = (db: Knex) => {
  setInterval(async () => {
    console.time('running cleanup');
    deleteOldFiles();
    await deleteOldUploads(db);
    db.raw(
      "DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '14 days' AND status = 'failed'"
    );
    console.timeEnd('running cleanup');
  }, MS_21);
};
