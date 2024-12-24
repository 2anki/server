import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export function getPageCount(pdfPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const pdfinfoBin =
      process.platform === 'darwin'
        ? '/usr/local/bin/pdfinfo'
        : '/usr/bin/pdfinfo';

    const pdfinfoProcess = spawn(pdfinfoBin, [pdfPath]);

    let stdout = '';
    let stderr = '';

    pdfinfoProcess.stdout.on('data', (data) => {
      stdout += data;
    });

    pdfinfoProcess.stderr.on('data', (data) => {
      stderr += data;
    });

    pdfinfoProcess.on('close', async (code) => {
      const pdfDir = path.dirname(pdfPath);
      const pdfBaseName = path.basename(pdfPath, path.extname(pdfPath));

      await fs.writeFile(
        path.join(pdfDir, `${pdfBaseName}_stdout.log`),
        stdout
      );
      await fs.writeFile(
        path.join(pdfDir, `${pdfBaseName}_stderr.log`),
        stderr
      );

      if (code !== 0) {
        reject(new Error('Failed to execute pdfinfo'));
        return;
      }

      const pageCount = parseInt(
        stdout
          .split('\n')
          .find((line) => line.startsWith('Pages:'))
          ?.split(/\s+/)[1] ?? '0'
      );

      if (!pageCount) {
        reject(new Error('Failed to get page count'));
        return;
      }

      resolve(pageCount);
    });
  });
}
