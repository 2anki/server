import { isHTMLFile, isMarkdownFile } from '../storage/checks';
import { markdownToHTML } from '../markdown';
import { File } from '../anki/decompress/types';

export function getHTMLContents(file: File | undefined) {
  const contents = file?.contents;
  if (!file || !contents) {
    return undefined;
  }

  if (isHTMLFile(file.name)) {
    return file.contents;
  }

  if (isMarkdownFile(file.name)) {
    return markdownToHTML(contents.toString());
  }
}
