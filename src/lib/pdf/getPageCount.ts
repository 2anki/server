import { execFile } from 'child_process';

export function getPageCount(pdfPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const pdfinfoBin =
      process.platform === 'darwin'
        ? '/usr/local/bin/pdfinfo'
        : '/usr/bin/pdfinfo';
    execFile(pdfinfoBin, [pdfPath], (error, stdout) => {
      if (error) {
        reject(new Error('Failed to execute pdfinfo'));
        return;
      }

      const pageCount = parseInt(
        stdout
          .split('\n')
          .find((line) => line.startsWith('Pages:'))
          ?.split(/\s+/)[1] || '0'
      );

      if (!pageCount) {
        reject(new Error('Failed to get page count'));
        return;
      }

      resolve(pageCount);
    });
  });
}
