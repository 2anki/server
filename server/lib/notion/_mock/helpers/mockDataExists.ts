import fs from 'fs';

import dataMockPath from './dataMockPath';
import { MockType } from './MockType';

export function mockDataExists(type: MockType, id: string) {
  const path = dataMockPath(type, id);
  return fs.existsSync(path);
}
