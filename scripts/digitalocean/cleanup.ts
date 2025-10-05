import fs from 'node:fs';
import { info, warning } from './logger';

export function cleanup(dumpFile: string): void {
  try {
    if (fs.existsSync(dumpFile)) {
      fs.unlinkSync(dumpFile);
      info(`Cleaned up dump file: ${dumpFile}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    warning(`Could not clean up dump file: ${message}`);
  }
}
