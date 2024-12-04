import {
  isHTMLFile,
  isMarkdownFile,
  isPlainText,
  isCSVFile,
  isPDFFile,
  isPPTFile,
} from '../../lib/storage/checks';

/**
 * XXX: Should we also support files without extensions?
 */
export const isZipContentFileSupported = (filename: string) =>
  isHTMLFile(filename) ??
  isMarkdownFile(filename) ??
  isPlainText(filename) ??
  isCSVFile(filename) ??
  isPDFFile(filename) ??
  isPPTFile(filename);
