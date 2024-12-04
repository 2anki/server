import { S3 } from 'aws-sdk';
import Workspace from '../parser/WorkSpace';
import path from 'path';
import fs from 'fs/promises';
import { execFile } from 'child_process';

export function convertPPTToPDF(
  name: string,
  contents: S3.Body,
  workspace: Workspace
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const sofficeBin =
      process.platform === 'darwin'
        ? '/Applications/LibreOffice.app/Contents/MacOS/soffice'
        : '/usr/bin/soffice';
    const tempFile = path.join(workspace.location, name);
    await fs.writeFile(tempFile, Buffer.from(contents as Buffer));

    const pdfFile = path.join(
      workspace.location,
      path.basename(name, path.extname(name)) + '.pdf'
    );

    execFile(
      sofficeBin,
      ['--headless', '--convert-to', 'pdf', tempFile],
      {
        cwd: workspace.location,
      },
      async (error, stdout, stderr) => {
        await fs.writeFile(path.join(workspace.location, 'stdout.log'), stdout);
        await fs.writeFile(path.join(workspace.location, 'stderr.log'), stderr);
        if (error) {
          reject(error);
        }
        resolve(await fs.readFile(pdfFile));
      }
    );
  });
}
