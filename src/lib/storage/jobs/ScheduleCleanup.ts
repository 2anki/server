import { Knex } from 'knex';

import { MS_21 } from './helpers/deleteOldUploads';
import { runCleanup } from './helpers/runCleanup';

export const ScheduleCleanup = (db: Knex) => {
  setInterval(() => runCleanup(db), MS_21);
};
