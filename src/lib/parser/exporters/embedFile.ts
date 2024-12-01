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

  if (file) {
    const newName = getUniqueFileName(filePath) + suffix;
    const contents = file.contents as string;
    if (contents) {
      exporter.addMedia(newName, contents);
    }
    return newName;
  } else {
    console.debug(
      JSON.stringify({
        hint: 'Missing relative path',
        filePath: filePath,
        fileNames: files.map((f) => f.name),
      })
    );
  }

  return null;
};
