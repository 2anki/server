import os from 'os';
import path from 'path';

import findRemoveSync from 'find-remove';
import { TIME_21_MINUTES_AS_SECONDS } from '../../constants';

export default function deleteOldFiles() {
  const locations = ['workspaces', 'uploads'];
  for (const loc of locations) {
    console.info(`finding & removing ${loc} files older than 21 minutes`);
    const result = findRemoveSync(path.join(os.tmpdir(), loc), {
      files: '*.*',
      age: { seconds: TIME_21_MINUTES_AS_SECONDS },
    });
    console.info(`result ${result}`);
  }
}
