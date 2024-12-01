import { writeFile } from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import Workspace from '../WorkSpace';
import { S3 } from 'aws-sdk';

function getPageCount(pdfPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    execFile('/usr/local/bin/pdfinfo', [pdfPath], (error, stdout) => {
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

function convertPage(
  pdfPath: string,
  page: number,
  totalPages: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputBase = `${pdfPath}-page${page}`;
    execFile(
      'pdftoppm',
      [
        '-png',
        '-f',
        page.toString(),
        '-l',
        page.toString(),
        pdfPath,
        outputBase,
      ],
      (error) => {
        if (error) {
          reject(new Error(`Failed to convert page ${page} to PNG`));
          return;
        }
        const pageNum = totalPages < 10 ? page : String(page).padStart(2, '0');
        resolve(outputBase + `-${pageNum}.png`);
      }
    );
  });
}

function combineIntoHTML(imagePaths: string[], title: string): string {
  const html = `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  ${Array.from({ length: imagePaths.length / 2 }, (_, i) => {
    const front = path.basename(imagePaths[i * 2]);
    const back = path.basename(imagePaths[i * 2 + 1]);
    return `<ul class="toggle">
    <li>
      <details>
        <summary>
        <img src="${front}" />
        </summary>
        <img src="${back}" />
      </details>
    </li>
    </ul>`;
  }).join('\n')}
</body>
</html>`;

  return html;
}

interface ConvertPDFToImagesInput {
  workspace: Workspace;
  noLimits: boolean;
  contents?: S3.Body;
  name?: string;
}

export async function convertPDFToImages(
  input: ConvertPDFToImagesInput
): Promise<Buffer> {
  const { contents, workspace, noLimits, name } = input;
  const pdfPath = path.join(workspace.location, name ?? 'Default.pdf');
  await writeFile(pdfPath, Buffer.from(contents as Buffer));

  const pageCount = await getPageCount(pdfPath);
  const title = path.basename(pdfPath);
  if (!noLimits && pageCount > 100) {
    throw new Error('PDF exceeds maximum page limit of 100');
  }

  const imagePaths = await Promise.all(
    Array.from({ length: pageCount }, (_, i) =>
      convertPage(pdfPath, i + 1, pageCount)
    )
  );

  const html = combineIntoHTML(imagePaths, title);
  return Buffer.from(html);
}
