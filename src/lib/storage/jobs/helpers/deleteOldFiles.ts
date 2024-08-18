import os from 'os';
import path from 'path';

import findRemoveSync from 'find-remove';
import { TIME_21_MINUTES_AS_SECONDS } from '../../../constants';

/**
 * Locally stored files are deleted after 21 minutes. This is to prevent the server from running out of space.
 * It will not affect files processed by the Notion integration which are stored in DigitalOcean space.
 * @param loc
 */
function deleteFile(loc: string) {
  console.time(`finding & removing ${loc} files older than 21 minutes`);
  findRemoveSync(path.join(os.tmpdir(), loc), {
    files: '*.*',
    age: { seconds: TIME_21_MINUTES_AS_SECONDS },
  });
  console.timeEnd(`finding & removing ${loc} files older than 21 minutes`);
}

/**
 * A convenience function to batch delete old files.
 * @param locations
 */
export default function deleteOldFiles(locations: string[]) {
  locations.forEach((loc) => {
    deleteFile(loc);
  });
}
