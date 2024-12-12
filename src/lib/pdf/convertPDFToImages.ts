import { writeFile } from 'fs/promises';
import path from 'path';
import Workspace from '../parser/WorkSpace';
import { S3 } from 'aws-sdk';
import { getPageCount } from './getPageCount';
import { convertPage } from './convertPage';
import { combineIntoHTML } from './combineIntoHTML';
import { existsSync } from 'fs';

interface ConvertPDFToImagesInput {
  workspace: Workspace;
  noLimits: boolean;
  contents?: S3.Body;
  name?: string;
}

export const PDF_EXCEEDS_MAX_PAGE_LIMIT =
  'PDF exceeds maximum page limit of 100 for free and anonymous users.';

export async function convertPDFToImages(
  input: ConvertPDFToImagesInput
): Promise<Buffer> {
  const { contents, workspace, noLimits, name } = input;
  const fileName = name
    ? path.basename(name).replace(/\.pptx?$/i, '.pdf')
    : 'Default.pdf';
  const pdfPath = path.join(workspace.location, fileName);

  if (!existsSync(pdfPath)) {
    await writeFile(pdfPath, Buffer.from(contents as Buffer));
  }

  const pageCount = await getPageCount(pdfPath);
  const title = path.basename(pdfPath);
  if (!noLimits && pageCount > 100) {
    throw new Error(PDF_EXCEEDS_MAX_PAGE_LIMIT);
  }

  const imagePaths = await Promise.all(
    Array.from({ length: pageCount }, (_, i) =>
      convertPage(pdfPath, i + 1, pageCount)
    )
  );

  const html = combineIntoHTML(imagePaths, title);
  return Buffer.from(html);
}
