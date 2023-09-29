import os from 'os';
import path from 'path';

import findRemoveSync from 'find-remove';
import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';

function deleteFile(loc: string) {
  console.time(`finding & removing ${loc} files older than 21 minutes`);
  findRemoveSync(path.join(os.tmpdir(), loc), {
    files: '*.*',
    age: { seconds: TIME_21_MINUTES_AS_SECONDS },
  });
  console.timeEnd(`finding & removing ${loc} files older than 21 minutes`);
}

export default function deleteOldFiles(locations: string[]) {
  locations.forEach((loc) => {
    deleteFile(loc);
  });
}
