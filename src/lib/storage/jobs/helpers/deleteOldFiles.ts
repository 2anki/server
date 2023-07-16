import os from 'os';
import path from 'path';

import findRemoveSync from 'find-remove';
import { ONE_HOUR } from '../../../constants';

const ONE_HOUR_OLD = ONE_HOUR * 1000;

export default function deleteOldFiles() {
  const locations = ['workspaces', 'uploads'];
  for (const loc of locations) {
    console.time(`finding & removing ${loc} files older than 21 minutes`);
    findRemoveSync(path.join(os.tmpdir(), loc), {
      files: '*.*',
      age: { seconds: ONE_HOUR_OLD },
    });
    console.timeEnd(`finding & removing ${loc} files older than 21 minutes`);
  }
}
