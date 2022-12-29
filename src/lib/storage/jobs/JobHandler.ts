import { Knex } from 'knex';

import deleteOldUploads, { MS_21 } from './helpers/deleteOldUploads';
import deleteOldFiles from './helpers/deleteOldFiles';

export const ScheduleCleanup = (db: Knex) => {
  setInterval(async () => {
    console.info('running cleanup');
    deleteOldFiles();
    await deleteOldUploads(db);
  }, MS_21);
};
