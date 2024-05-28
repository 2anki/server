import path from 'path';
import fs from 'fs';
import { BUILD_DIR } from '../../lib/constants';

export const getIndexFileContents = () => {
  const indexFilePath = path.join(BUILD_DIR, 'index.html');
  const contents = fs.readFileSync(indexFilePath, 'utf8');
  return contents;
};
