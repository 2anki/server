import {
  isHTMLFile,
  isMarkdownFile,
  isPlainText,
  isCSVFile,
  isPDFFile,
  isXLSXFile,
} from '../../lib/storage/checks';

const isFileWithoutExtension = (filename: string) =>
  filename && filename.indexOf('.') === -1;

export const isZipContentFileSupported = (filename: string) =>
  isHTMLFile(filename) ??
  isMarkdownFile(filename) ??
  isPlainText(filename) ??
  isCSVFile(filename) ??
  isPDFFile(filename) ??
  isXLSXFile(filename) ??
  isFileWithoutExtension(filename);
