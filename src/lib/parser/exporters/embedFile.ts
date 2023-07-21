import { SuffixFrom } from '../../misc/file';
import getUniqueFileName from '../../misc/getUniqueFileName';
import CustomExporter from './CustomExporter';
import { File } from '../../anki/zip';
import { isFileNameEqual } from '../../storage/types';
import Bugsnag from '@bugsnag/js';

export const embedFile = (
  exporter: CustomExporter,
  files: File[],
  filePath: string
): string | null => {
  const newName = getUniqueFileName(filePath) + SuffixFrom(filePath);
  const file = files.find((f) => isFileNameEqual(f, filePath));
  const contents = file?.contents;

  if (typeof contents === 'string') {
    exporter.addMedia(newName, contents);
  } else {
    Bugsnag.notify(new Error(`Failed to embed file ${filePath}`));
    return null;
  }

  return newName;
};
