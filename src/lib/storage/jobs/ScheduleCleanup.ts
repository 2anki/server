import { Knex } from 'knex';

import deleteOldUploads, {
  MS_21,
  MS_24_HOURS,
} from './helpers/deleteOldUploads';
import { runFileSystemCleanup } from './helpers/runFileSystemCleanup';
import { updateStripeSubscriptions } from './helpers/updateStripeSubscriptions';

const STRIPE_SYNC_INTERVAL_MS = 60 * 60 * 1000;

export const ScheduleCleanup = (db: Knex) => {
  setInterval(() => runFileSystemCleanup(db), MS_21);

  setInterval(
    () => deleteOldUploads(db).then(() => console.info('deleted old uploads')),
    MS_24_HOURS
  );

  setInterval(
    () => updateStripeSubscriptions().catch((error) => console.error('[cron] Stripe subscription sync failed:', error)),
    STRIPE_SYNC_INTERVAL_MS
  );
};
