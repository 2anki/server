import path from 'path';
import ensureExists from './ensureExists';
import { Mock } from './types';

export default function dataMockPath(type: Mock, id: string): string {
  const dir = path.join(__dirname, `../payloads/${type}`);
  ensureExists(dir);
  return path.join(dir, `${id}.json`);
}
