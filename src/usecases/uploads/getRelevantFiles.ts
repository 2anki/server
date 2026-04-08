import { File } from '../../lib/zip/zip';

export function getRelevantFiles(
  fileName: string,
  allFiles: File[]
): File[] {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const baseNameWithoutNotionId = baseName.replace(/ [0-9a-f]{32}$/, '');

  return allFiles.filter(
    (f) =>
      f.name === fileName ||
      f.name.startsWith(baseName + '/') ||
      f.name.startsWith(baseNameWithoutNotionId + '/')
  );
}
