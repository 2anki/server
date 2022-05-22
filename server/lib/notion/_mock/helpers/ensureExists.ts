import fs from 'fs';

export default function ensureExists(location: string) {
  if (!fs.existsSync(location)) {
    console.info(`creating: ${location}`);
    fs.mkdirSync(location, { recursive: true });
  }
}
