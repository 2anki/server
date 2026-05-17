import path from 'path';
import fs from 'fs';
import { BUILD_DIR } from '../../lib/constants';

export const getIndexFileContents = (): string | null => {
  const indexFilePath = path.join(BUILD_DIR, 'index.html');
  try {
    return fs.readFileSync(indexFilePath, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
};
