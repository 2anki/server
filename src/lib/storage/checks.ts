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

export const isImageFileEmbedable = (url: string) =>
  !url.startsWith('http') && !url.startsWith('data:image');

export const isCSVFile = (fileName: string) => /.csv$/i.exec(fileName);

export const isPDFFile = (fileName: string) => /.pdf$/i.exec(fileName);
