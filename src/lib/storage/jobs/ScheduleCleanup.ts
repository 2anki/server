import { Knex } from 'knex';

import { ONE_HOUR } from '../../constants';
import { runCleanup } from './helpers/runCleanup';

const EVERY_HOUR_MS = ONE_HOUR * 1000;

export const ScheduleCleanup = (db: Knex) => {
  setInterval(() => runCleanup(db), EVERY_HOUR_MS);
};
