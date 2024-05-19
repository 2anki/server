import { isHTMLFile, isMarkdownFile } from '../storage/checks';
import { markdownToHTML } from '../markdown';
import { File } from '../anki/zip';

export function getFileContents(file: File | undefined, convertToHTML = true) {
  const contents = file?.contents;
  if (!file || !contents) {
    return undefined;
  }

  if (isHTMLFile(file.name)) {
    return file.contents;
  }

  if (isMarkdownFile(file.name) && convertToHTML) {
    return markdownToHTML(contents.toString());
  }

  return contents.toString();
}
