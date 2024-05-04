import { spawn } from 'node:child_process';

import { listFiles } from './listFiles';
import { File } from './types';

const TAR_PATH = '/usr/bin/tar';

export function unpack(filePath: string, workspace: string): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const decompressProcess = spawn(TAR_PATH, ['xvf', filePath], {
      cwd: workspace,
    });
    decompressProcess.stdout.on('data', (data) => {
      console.log(`tar output: ${data}`);
    });
    decompressProcess.stderr.on('data', (data) => {
      console.error(`tar error: ${data}`);
      reportError(data);
    });
    decompressProcess.on('close', () => {
      // We are not reading the status code because we support partial extraction
      listFiles(workspace).then(resolve).catch(reject);
    });
  });
}
