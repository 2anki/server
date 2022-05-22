import fs from 'fs';

export default function savePayload(location: string, payload: any) {
  fs.writeFileSync(location, JSON.stringify(payload, null, 4));
}
