import path from 'path';
import os from 'os';

import findRemoveSync from 'find-remove';
import { Knex } from 'knex';

import { TIME_21_MINUTES_AS_SECONDS } from '../constants';
import StorageHandler from '../storage/StorageHandler';

const __deleteOldFiles = () => {
  const locations = ['workspaces', 'uploads'];
  for (const loc of locations) {
    console.info(`finding & removing ${loc} files older than 21 minutes`);
    const result = findRemoveSync(path.join(os.tmpdir(), loc), {
      files: '*.*',
      age: { seconds: TIME_21_MINUTES_AS_SECONDS },
    });
    console.info(`result ${result}`);
  }
};

const MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;
async function __deleteOldUploads(db: Knex) {
  const s = new StorageHandler();
  const files = await s.getContents();
  const now = new Date();

  for (const file of files) {
    /* @ts-ignore */
    if (now - new Date(file.LastModified) > MS_21) {
      const upload = await db('uploads')
        .where('key', file.Key)
        .returning('owner');
      /* @ts-ignore */
      if (upload.owner) {
        console.info('file has an owner, skipping');
        continue;
      } else {
        await s.delete(file);
        console.debug(
          `Delete **** which was last modified on ${file.LastModified}`,
        );
      }
    }
  }
}

export const ScheduleCleanup = (db: Knex) => {
  setInterval(async () => {
    console.info('running cleanup');
    __deleteOldFiles();
    await __deleteOldUploads(db);
  }, MS_21);
};
