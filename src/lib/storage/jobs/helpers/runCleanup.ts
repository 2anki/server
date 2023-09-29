import path from 'path';
import os from 'os';

import { Knex } from 'knex';

import deleteOldFiles from './deleteOldFiles';
import deleteOldUploads from './deleteOldUploads';
import { getDatabase } from '../../../../data_layer';

export const runCleanup = async (database: Knex) => {
  console.time('running cleanup');
  const locations = [
    process.env.WORKSPACE_BASE ?? path.join(os.tmpdir(), 'workspaces'),
    process.env.UPLOAD_BASE ?? path.join(os.tmpdir(), 'uploads'),
  ];

  deleteOldFiles(locations);
  await deleteOldUploads(database);
  database.raw(
    "DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '14 days' AND status = 'failed'"
  );
  console.timeEnd('running cleanup');
};

if (require.main === module) {
  runCleanup(getDatabase());
}
