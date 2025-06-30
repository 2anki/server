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
        // Check if the error is due to a password-protected PDF
        if (stderr.includes('Encrypted') || stderr.includes('password')) {
          reject(
            new Error(
              'The PDF file is password-protected. Please remove the password protection and try again, or you can turn off PDF processing by unchecking "Process PDF Files" in the settings to skip PDF processing of ZIP files containing PDFs.'
            )
          );
          return;
        }
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
