import fs from 'fs';

import dataMockPath from './dataMockPath';
import { Mock } from './types';

export function mockDataExists(type: Mock, id: string) {
  const path = dataMockPath(type, id);
  return fs.existsSync(path);
}
