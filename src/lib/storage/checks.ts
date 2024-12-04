export const isMarkdownFile = (fileName: string) => /.md$/i.exec(fileName);

export const isHTMLFile = (fileName: string) => /.html$/i.exec(fileName);

export const isZIPFile = (fileName: string) => /.zip$/i.exec(fileName);

export const isPlainText = (fileName: string) => /\.txt$/i.exec(fileName);

export function hasMarkdownFileName(fileNames: string[]) {
  return fileNames.some(isMarkdownFile);
}

export const isSoundCloudURL = (url: string) => /soundcloud\.com/.exec(url);

export const isTwitterURL = (url: string) => /twitter\.com/.exec(url);

export const isVimeoURL = (url: string) => /vimeo\.com/.exec(url);

export const isImageFileEmbedable = (url: string) => {
  const isLocalPath = !url.startsWith('http') && !url.startsWith('data:image');
  const hasTraversal = url.includes('../') || url.includes('..\\');
  return isLocalPath && !hasTraversal;
};

export const isCSVFile = (fileName: string) => /.csv$/i.exec(fileName);

export const isPDFFile = (fileName: string) => /.pdf$/i.exec(fileName);

/**
 * A file is considered a potential zip file if it does not contain a period.
 * Since zip files are not named with a period, but it is possible to upload such files using drag and drop.
 * @param filename
 * @returns
 */
export const isPotentialZipFile = (filename: string): boolean => {
  return filename.trim().endsWith('.') || !filename.includes('.');
};
