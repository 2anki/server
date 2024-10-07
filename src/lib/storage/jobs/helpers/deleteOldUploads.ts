import { Knex } from 'knex';

import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';
import StorageHandler from '../../StorageHandler';
import { deleteNonSubScriberUploadsInDatabase } from './deleteNonSubScriberUploadsInDatabase';
import { deleteDanglingUploadsInBucket } from './deleteDanglingUploadsInBucket';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;
export const MS_24_HOURS = 1000 * 60 * 60 * 24;

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
  await deleteNonSubScriberUploadsInDatabase(db, storage);
  await deleteDanglingUploadsInBucket(db, storage);
  await deleteResolvedFeedbackAttachments(db, storage);
}
