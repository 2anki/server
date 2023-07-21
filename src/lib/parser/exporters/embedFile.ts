import Bugsnag from '@bugsnag/js';
import { File } from '../../anki/zip';
import { SuffixFrom } from '../../misc/file';
import getUniqueFileName from '../../misc/getUniqueFileName';
import CustomExporter from './CustomExporter';

export const embedFile = (
  exporter: CustomExporter,
  files: File[],
  filePath: string
): string | null => {
  const suffix = SuffixFrom(filePath);
  let file = files.find((f) => f.name === filePath);
  if (!file) {
    const lookup = `${exporter.firstDeckName}/${filePath}`.replace(
      /\.\.\//g,
      ''
    );
    file = files.find((f) => {
      if (f.name === lookup || f.name.endsWith(filePath)) {
        return f;
      }
    });
    if (!file) {
      Bugsnag.notify(
        `Missing relative path to ${filePath} used ${exporter.firstDeckName}`
      );
      return null;
    }
  }
  const newName = getUniqueFileName(filePath) + suffix;
  const contents = file.contents as string;
  if (contents) {
    exporter.addMedia(newName, contents);
  }
  return newName;
};
