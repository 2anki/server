import { Knex } from 'knex';

import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';
import StorageHandler from '../../StorageHandler';
import { Upload } from '../../types';
import { S3 } from 'aws-sdk';

export const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;

const isFileOld = (file: S3.Object) => {
  const now = new Date();
  if (file.LastModified) {
    return now.getMilliseconds() - file.LastModified.getMilliseconds() > MS_21;
  }
  return false;
};

const hasOwner = async (
  key: S3.ObjectKey | undefined,
  db: Knex
): Promise<boolean> => {
  if (!key) {
    return false;
  }
  const upload = (await db('uploads')
    .where('key', key)
    .returning('owner')) as Upload;
  return Boolean(upload.owner);
};

export default async function deleteOldUploads(db: Knex) {
  const s = new StorageHandler();
  const files = await s.getContents();

  if (!files) {
    return;
  }

  for (const file of files) {
    if (!file || !isFileOld(file)) {
      continue;
    }

    if (await hasOwner(file.Key, db)) {
      console.info('file has an owner, skipping');
      continue;
    }

    await s.delete(file);
    console.debug(
      `Delete **** which was last modified on ${file.LastModified}`
    );
  }
}
