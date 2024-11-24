import {
  isHTMLFile,
  isMarkdownFile,
  isPlainText,
  isCSVFile,
} from '../../lib/storage/checks';

/**
 * XXX: Should we also support files without extensions?
 */
export const isZipContentFileSupported = (filename: string) =>
  isHTMLFile(filename) ??
  isMarkdownFile(filename) ??
  isPlainText(filename) ??
  isCSVFile(filename);
