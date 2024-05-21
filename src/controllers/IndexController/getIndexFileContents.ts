import path from 'path';
import fs from 'fs';
import { BUILD_DIR } from '../../lib/constants';

const removeGoogleScript = (contents: string) => {
  const regex =
    /<script\s+async\s+src="https:\/\/pagead2\.(googlesyndication|doubleclick)\.com[^"]+"\s+crossorigin="anonymous"><\/script>/g;
  return contents.replace(regex, '');
};

export const getIndexFileContents = (isPaying: boolean) => {
  const indexFilePath = path.join(BUILD_DIR, 'index.html');
  const contents = fs.readFileSync(indexFilePath, 'utf8');

  if (isPaying) {
    return removeGoogleScript(contents);
  }

  return contents;
};
