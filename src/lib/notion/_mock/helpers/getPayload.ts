import fs from 'fs';

import { Payload } from './types';

export default function getPayload(path: string): Payload {
  return JSON.parse(fs.readFileSync(path).toString());
}
