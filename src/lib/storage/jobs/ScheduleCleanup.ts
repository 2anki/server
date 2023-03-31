import { Knex } from 'knex';

import deleteOldUploads, { MS_21 } from './helpers/deleteOldUploads';
import deleteOldFiles from './helpers/deleteOldFiles';

export const ScheduleCleanup = (db: Knex) => {
  setInterval(async () => {
    console.time('running cleanup');
    deleteOldFiles();
    await deleteOldUploads(db);
    console.timeEnd('running cleanup');
  }, MS_21);
};
