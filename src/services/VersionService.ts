import fs from 'fs';

import { resolvePath } from '../lib/constants';

const appInfo = JSON.parse(
  fs.readFileSync(resolvePath(__dirname, '../../package.json')).toString()
);

class VersionService {
  public getVersion(): string {
    return `Notion to Anki v${appInfo.version}`;
  }
}

export default VersionService;
