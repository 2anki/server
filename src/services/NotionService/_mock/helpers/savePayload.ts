import fs from 'fs';

import { Payload } from './types';

export default function savePayload(location: string, payload: Payload) {
  fs.writeFileSync(location, JSON.stringify(payload, null, 4));
}
