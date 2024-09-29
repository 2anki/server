import { Knex } from 'knex';
import Uploads from '../../../../data_layer/public/Uploads';

import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';
import StorageHandler from '../../StorageHandler';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;
export const MS_24_HOURS = 1000 * 60 * 60 * 24;

const MAX_KEYS = 100_000;

const deleteNonSubScriberUploads = async (
  db: Knex,
  storage: StorageHandler
) => {
  const query = await db.raw(`
    SELECT up.key FROM users u JOIN uploads up ON u.id = up.owner WHERE u.patreon = false;
  `);
  // TODO: review this again now that we have subscriptions
  const nonSubScriberUploads: Uploads[] | undefined = query.rows;
  if (!nonSubScriberUploads) {
    return;
  }

  for (const upload of nonSubScriberUploads.flat()) {
    await storage.delete(upload.key);
    await db('uploads').delete().where('key', upload.key);
  }
};

const deleteDanglingUploads = async (db: Knex, storage: StorageHandler) => {
  const query = await db.raw(`
    SELECT up.key FROM users u JOIN uploads up ON u.id = up.owner WHERE u.patreon = true;
    `);
  const subScriberUploads: Uploads[] | [] = query.rows || [];
  const storedFiles = await storage.getContents(MAX_KEYS);
  const nonPatreonFiles =
    storedFiles?.filter(
      (f) => f.Key && !subScriberUploads.find((up) => up.key === f.Key)
    ) ?? [];

  for (const file of nonPatreonFiles) {
    if (file.Key) {
      storage.delete(file.Key);
    }
  }
};

const deleteResolvedFeedbackAttachments = async (
  db: Knex,
  storage: StorageHandler
) => {
  const resolvedFeedback = await db('feedback')
    .select('attachments')
    .where('is_acknowledged', true);

  for (const feedback of resolvedFeedback) {
    const attachments = JSON.parse(feedback.attachments);
    for (const attachment of attachments) {
      await storage.delete(attachment);
    }
  }

  await db('feedback').where('is_acknowledged', true).delete();
};

export default async function deleteOldUploads(db: Knex) {
  const storage = new StorageHandler();
  await deleteNonSubScriberUploads(db, storage);
  await deleteDanglingUploads(db, storage);
  await deleteResolvedFeedbackAttachments(db, storage);
}
