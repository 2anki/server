import os from 'os';
import path from 'path';

import findRemoveSync from 'find-remove';
import { CLEANUP_AGE_SECONDS } from '../../../constants';

/**
 * Locally stored files are deleted after 21 minutes. This is to prevent the server from running out of space.
 * It will not affect files processed by the Notion integration which are stored in DigitalOcean space.
 * @param loc
 */
function deleteFile(loc: string) {
  console.time(`finding & removing old ${loc} files`);
  findRemoveSync(path.join(os.tmpdir(), loc), {
    files: '*.*',
    age: { seconds: CLEANUP_AGE_SECONDS },
  });
  console.timeEnd(`finding & removing old ${loc} files`);
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
