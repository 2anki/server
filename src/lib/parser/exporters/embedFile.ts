import fs, { existsSync } from 'fs';
import path from 'path';

import { File } from '../../zip/zip';
import { SuffixFrom } from '../../misc/file';
import getUniqueFileName from '../../misc/getUniqueFileName';
import CustomExporter from './CustomExporter';
import Workspace from '../WorkSpace';

const getFile = (
  exporter: CustomExporter,
  files: File[],
  filePath: string,
  workspace: Workspace
): File | undefined => {
  const fullPath = path.resolve(workspace.location, filePath);
  if (fullPath.startsWith(workspace.location) && existsSync(fullPath)) {
    const buffer = fs.readFileSync(fullPath);
    return {
      name: fullPath,
      contents: buffer,
    } as File;
  }

  const asRootFile = files.find((f) => f.name === filePath);
  if (asRootFile) {
    return asRootFile;
  }
  const parent = exporter.firstDeckName.replace(/.html /, '/');
  const asChildFile = files.find((f) => f.name === `${parent}/${filePath}`);
  if (asChildFile) {
    return asChildFile;
  }

  /*
   * Could not find file, try to find it by ending.
   * This happens in deeply nested directories.
   * Example: using a huge database
   */
  const normalized = filePath.replace(/\.\.\//g, '');
  const usingSuffix = files.find(
    (f) => f.name.endsWith(filePath) || f.name.endsWith(normalized)
  );
  if (usingSuffix) {
    return usingSuffix;
  }

  return undefined;
};

interface EmbedFileInput {
  exporter: CustomExporter;
  files: File[];
  filePath: string;
  workspace: Workspace;
}

export const embedFile = (input: EmbedFileInput): string | null => {
  const { exporter, files, filePath, workspace } = input;

  const suffix = SuffixFrom(filePath);
  const file = getFile(exporter, files, filePath, workspace);

  /**
   * The found file can be a file path in the workspace or a file in the zip or url.
   * The contents is used first to avoid name conflicts. URL can have conflicts but so far
   * no bug reports.
   */
  if (file) {
    const contents = file.contents as string;
    const newName = getUniqueFileName(contents ?? filePath) + suffix;
    if (contents) {
      exporter.addMedia(newName, contents);
    }
    return newName;
  }

  console.debug(
    JSON.stringify({
      hint: 'Missing relative path',
      filePath: filePath,
      fileNames: files.map((f) => f.name),
    })
  );

  return null;
};
