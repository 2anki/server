import fs from 'node:fs';
import { info, warning } from './logger';

export function cleanup(dumpFile: string): void {
  try {
    if (fs.existsSync(dumpFile)) {
      fs.unlinkSync(dumpFile);
      info(`Cleaned up dump file: ${dumpFile}`);
    }
  } catch (err) {
    warning(`Could not clean up dump file: ${(err as Error).message}`);
  }
}
